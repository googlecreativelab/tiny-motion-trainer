#!/usr/bin/env python

# Copyright 2021 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import shutil
import sys
import subprocess
import io
import os
import time
import logging
import tarfile
from flask import Flask, request, send_file, render_template, Response
from werkzeug.utils import secure_filename
from flask_cors import CORS
import shortuuid
import tensorflow as tf
import numpy as np
import json

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
CORS(app, resources={r"/*": {"origins": "*"}})

ARDUINO_FOLDER_NAME = 'TinyMotionTrainer-Example'


def keras_to_tflite(bin_file, quantize=False, quantize_data=None):
    # Convert the model.
    model = tf.keras.models.load_model(bin_file)
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    if quantize:
        print('QUANTIZE: TRUE')
        print(quantize_data)

        def representative_dataset_generator():
            for value in quantize_data:
                # Each scalar value must be inside of a 2D array that is wrapped in a list
                yield [np.array(value, dtype=np.float32, ndmin=2)]

        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.representative_dataset = representative_dataset_generator
        # converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8] # For EdgeTPU, no float ops allowed
        # converter.inference_input_type = tf.uint8
        # converter.inference_output_type = tf.uint8
    else:
        print('QUANTIZE: FALSE')
    tflite_model = converter.convert()

    base_path = os.path.splitext(bin_file)[0]
    out_file = base_path + ".tflite"

    # Save the TF Lite model.
    with tf.io.gfile.GFile(out_file, 'wb') as f:
        f.write(tflite_model)
    return out_file


def tfjs_to_keras(json_file):
    base_path = os.path.splitext(json_file)[0]
    out_file = base_path + '.hdf5'
    result = subprocess.check_output(['tensorflowjs_converter', '--input_format=tfjs_layers_model',
                                      '--output_format=keras', json_file, out_file])
    print(result)
    return out_file


def tflite_to_c(tflite_file, out_folder):
    base_path = os.path.splitext(tflite_file)[0]
    out_path = os.path.join(out_folder, 'model.h')

    c_array = "const unsigned char model[] = {\n"

    ps = subprocess.Popen(('cat', tflite_file), stdout=subprocess.PIPE)
    output = subprocess.check_output(('xxd', '-i'), stdin=ps.stdout)
    ps.wait()

    c_array += output
    c_array += "\n};"

    with open(out_path, 'w') as f:
        f.write(c_array)

    return c_array


def make_tarfile(tmp_dir):
    timestr = time.strftime("%Y%m%d-%H%M%S")
    output_filename = os.path.join(tmp_dir, 'final.tgz')
    with tarfile.open(output_filename, "w:gz") as tar:
        tar.add(tmp_dir, arcname=os.path.sep)
    return output_filename


def get_and_remove_file(file_path):
    return_data = io.BytesIO()
    with open(file_path, 'rb') as fo:
        return_data.write(fo.read())

    # (after writing, cursor will be at last byte, so move it to start)
    return_data.seek(0)
    os.remove(file_path)

    return return_data


def generate_arduino_code(out_folder, request_args, version):
    delay = request_args.get('delay', type=int)
    numSamples = request_args.get('numSamples', type=int)
    threshold = request_args.get('sensitivity', type=float)

    labels = request_args.get('labels', type=str).split(',')
    labels = ', '.join(['"' + x + '"' for x in labels])

    out_path = os.path.join(out_folder, ARDUINO_FOLDER_NAME + '.ino')
    code = render_template('ArduinoExample-v' + version + '.txt', delay=delay,
                           numSamples=numSamples, threshold=threshold, labels=labels)
    with open(out_path, 'w') as f:
        f.write(code)
    return out_path


@ app.route('/xxd')
def xxd_test():
    output = "eeh"
    try:
        output = subprocess.check_output(
            ['xxd', '-v'], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as exc:
        output = "Status : FAIL - return code: " + \
            str(exc.returncode) + ", output: " + exc.output
    else:
        output = "Output: \n{}\n".format(output)
    return output


@ app.route('/node')
def node_test():
    output = "eeh"
    try:
        output = subprocess.check_output(
            ['tensorflowjs_converter', '-v'], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError as exc:
        output = "Status : FAIL - return code: " + \
            str(exc.returncode) + ", output: " + exc.output
    else:
        output = "Output: \n{}\n".format(output)
    return output


@ app.route('/')
def hello_world():
    return 'Hello, World!'


@ app.route('/render_test')
def render_test():
    labels = ', '.join(['"test1"', '"test2"'])
    resp = render_template('ArduinoExample.txt', delay=123,
                           numSamples=45, threshold=1.2, labels=labels)
    return Response(resp, mimetype='text/plain')


@ app.route('/quantize_test')
def quantize_test():
    labels = ', '.join(['"test1"', '"test2"'])
    resp = render_template('ArduinoExample.txt', delay=123,
                           numSamples=45, threshold=1.2, labels=labels)
    return Response(resp, mimetype='text/plain')


@ app.route('/to-tflite', methods=['GET', 'POST'])
def to_tflite():
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    tmp_dir = app.config['UPLOAD_FOLDER'] + shortuuid.uuid() + '/'
    os.mkdir(tmp_dir)

    error = None
    file_data = None
    if request.method == 'POST':
        try:
            print(request.files)
            f = request.files['model.weights.bin']
            weights_path = tmp_dir + secure_filename(f.filename)
            f.save(weights_path)
            f = request.files['model.json']
            json_path = tmp_dir + secure_filename(f.filename)
            f.save(json_path)

            # convert to keras
            keras_path = tfjs_to_keras(json_path)

            quantize = request.args.get('quantize', type=bool, default=False)
            quantize_data_str = request.form.get(
                'quantize_data', type=str, default=None)
            quantize_data = None

            version = request.args.get('version', type=str, default='2')

            if quantize_data_str:
                quantize_data = json.loads(quantize_data_str)

            tflite_path = keras_to_tflite(keras_path, quantize, quantize_data)

            file_data = get_and_remove_file(tflite_path)
        except:
            print("Unexpected error:", sys.exc_info()[0])
            raise
        finally:
            # cleanup
            shutil.rmtree(tmp_dir)
            if error:
                return sys.exc_info()[0]
            else:
                timestr = time.strftime("%Y%m%d-%H%M%S")
                output_filename = 'model-' + timestr + '.tflite'
                return send_file(file_data, mimetype='application/octet-stream', attachment_filename=output_filename)


@ app.route('/proc', methods=['GET', 'POST'])
def upload_file():

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    tmp_dir = app.config['UPLOAD_FOLDER'] + shortuuid.uuid() + '/'
    os.mkdir(tmp_dir)

    error = None
    file_data = None
    if request.method == 'POST':
        # try:
        print(request.files)
        f = request.files['model.weights.bin']
        weights_path = tmp_dir + secure_filename(f.filename)
        f.save(weights_path)
        f = request.files['model.json']
        json_path = tmp_dir + secure_filename(f.filename)
        f.save(json_path)

        # convert to keras
        keras_path = tfjs_to_keras(json_path)

        quantize = request.args.get('quantize', type=bool, default=False)
        quantize_data_str = request.form.get(
            'quantize_data', type=str, default=None)
        quantize_data = None

        version = request.args.get('version', type=str, default='2')

        if quantize_data_str:
            quantize_data = json.loads(quantize_data_str)

        tflite_path = keras_to_tflite(keras_path, quantize, quantize_data)

        code_path = os.path.join(tmp_dir, ARDUINO_FOLDER_NAME)
        os.mkdir(code_path)

        generate_arduino_code(code_path, request.args, version)

        c_header_path = tflite_to_c(tflite_path, code_path)

        tar_file = make_tarfile(tmp_dir)
        file_data = get_and_remove_file(tar_file)
        # except:
        #     print("Unexpected error:", sys.exc_info()[0])
        #     raise
        # finally:
        # cleanup
        shutil.rmtree(tmp_dir)
        if error:
            return sys.exc_info()[0]
        else:
            timestr = time.strftime("%Y%m%d-%H%M%S")
            output_filename = 'tinyml-gesture-' + timestr + '.tgz'
            return send_file(file_data, mimetype='application/tar+gzip', attachment_filename=output_filename)


@app.errorhandler(500)
def server_error(e):
    # Log the error and stacktrace.
    logging.exception('An error occurred during a request.')
    return 'An internal error occurred.', 500


if __name__ == '__main__':
    print("uploads will go to " + app.config['UPLOAD_FOLDER'])
    app.run(debug=True)

# [END app]
