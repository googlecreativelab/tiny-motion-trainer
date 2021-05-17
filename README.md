# Tiny Motion Trainer

## _Train and test IMU based TFLite models on the Web_

## Overview

Since 2009, coders have created thousands of experiments using Chrome, Android, AI, WebVR, AR and more. We showcase these projects and a variety of helpful tools and resources to inspire a diverse community of makers to explore, create, and share what’s possible with these technologies.

**Tiny Motion Trainer** is a part of the Tensorflow Microcontroller Experiments, a collection of open source, interactive projects designed to demonstrate some fun ways to combine Arduino and Tensorflow Lite for Microcontrollers.

These projects were built with the
[Arduino Sense 33 BLE](https://store.arduino.cc/usa/nano-33-ble-sense "Arduino Store"), [Tensorflow Lite for Microcontrollers](https://www.tensorflow.org/lite/microcontrollers "TFL4M"), standard web technologies ( HTML, CSS & Javascript).

---

## Experiment description

[Tiny Motion Trainer](https://experiments.withgoogle.com/tiny-motion-trainer "Tiny Motion Trainer") lets you train and test machine learning models for your Arduino Nano 33 BLE Sense in the browser. The webpage then provides a TensorFlow for Microcontrollers model and some sample code to get you started on using the model.

Other experiments to explore:

- [Air Snare](https://experiments.withgoogle.com/air-snare "Air Snare Google Experiment") lets you play the drums in the air.
- [Finger User Interface or FUI (pronounced Foo-ey)](https://experiments.withgoogle.com/fui "FUI") - lets you control your devices with the wave of a finger.

---

## Tools

- Linux, MacOS or Windows computer with [Chrome](https://www.google.com/chrome/?brand=WHAR&geo=US&gclid=Cj0KCQjw9_mDBhCGARIsAN3PaFNRBCVUxmhR1QPA2LHaoELEr9yc1KkSNQ-Jc9KVZd8Sq2ux5gR6mJsaAm_6EALw_wcB&gclsrc=aw.ds "Chrome") installed
- Tensorflow Microcontroller Challenge Kit by Sparkfun or [Arduino Nano BLE Sense 33](https://store.arduino.cc/usa/nano-33-ble-sense "Arduino Nano")
- [Micro USB](https://www.google.com/search?rlz=1C5CHFA_enUS858US858&sxsrf=ALeKk01CbJTvQbYgX6arJbsjcRVmv-3-RQ:1584929968297&q=Micro+USB+cable&spell=1&sa=X&ved=2ahUKEwjl8IOexK_oAhXDqZ4KHZ0mCmcQBSgAegQIDhAn&biw=1680&bih=832 "Micro USB") cable (If you're on a USB-C laptop, instead get a [USB-C to Micro USB](https://www.google.com/search?&q=USB-C+to+Micro+USB+cable "USB-C to Micro USB") cable)
- Rubberband
- [Optional] Battery

---

## Install and Run

Flashing: Using the Arduino Nano Sense 33 BLE

1. Install the [Arduino IDE ](https://www.arduino.cc/en/software "Arduino IDE")

2. Setup Arduino board:

- Plug in the board
- Install the board by navigating to Tools > Board > Boards Manager and search for Arduino Mbed OS Nano Boards. Full instructions (including drivers required for Windows) [here.](https://www.arduino.cc/en/Guide/NANO33BLESense/ "Arduino Guide")
- FAQ for connection problems can be found [here.](https://github.com/tinyMLx/appendix/blob/main/ArduinoFAQ.md "Arduino Guide")
- After the board is installed, select it under to Tools > Board > Arduino Mbed OS Nano Boards > Arduino Nano 33 BLE
  ![Arduino board](/readme_images/board.png)

- Select the port by navigating to Tools -> Port -> dev/cu... (Arduino Nano 33 BLE)
  ![Arduino Port](/readme_images/port.png)

3. Install Arduino libraries

- Navigate to Tools > Manage Libraries
- Search for and install:
- Arduino_LSM9DS1
- ArduinoBLE
- Arduino_TensorFlowLite
  ![Manage libraries](/readme_images/library.png)
  ![TensorFlow Lite Library](/readme_images/tflib.png)

4. Open the sketch and flash

- Download the BLE Interface [file](https://tinyml-experiment-ble-imu-interface-dot-gweb-tf-micro-exp.uc.r.appspot.com/tinyml-experiment-imu-ble-interface.zip "file")
- Unzip the downloaded BLE Interface file, open the **arduino** <folder> and double click on <tinyml-experiment-imu-ble-interface.ino> file
- Click the Right arrow in the top left corner to build and upload the sketch.  
  ![Arduino Port](/readme_images/buttons.png)

- **Warning**: This process may take a few minutes. Also, warnings may populate but the upload should still succeed in spite of them.
- If the sketch is installed, the LED on the board should flash red and green.

5. Go to the URL related to the experiment. The URL can be found below and play!

- [Tiny Motion Trainer](https://experiments.withgoogle.com/tiny-motion-trainer/view "Tiny Motion Trainer")

---

## Using the Tensorflow Microcontroller Challenge Kit by Spark Fun

The board that comes with the Tensorflow Microcontroller Challenge Kit by Spark Fun comes preflashed with a sketch that will work with some of the experiments right out of the box. If you are using one of the “Tensorflow Micro Challenge” kits and you just want to jump right into playing with the experiments then you can simply connect your arduino to a power source (USB or Battery) and connect to one of the following experiment URLs:

- [Air Snare](https://experiments.withgoogle.com/air-snare/view "Air Snare")
- [Finger User Interface (FUI)](https://experiments.withgoogle.com/finger-user-interface/view "FUI")
- [Tiny Motion Trainer](https://experiments.withgoogle.com/tiny-motion-trainer/view "Tiny Motion Trainer")

---

## FAQ & Common Errors

**What exactly is being transferred when I “connect”?**
When you’re connecting the board to your computer, a pre-trained Tensorflow Lite machine learning model gets transferred over BLE onto the device. The sketches that are uploaded to the Arduino include a common TensorFlow Lite for Microcontrollers model architecture. The different experiment websites change the behavior of the sketch by changing the model to one specifically made for the experience.

**What if I’m having issues connecting via bluetooth?**
If you are having issues connecting try the following:

1. Make sure your browser (Chrome or Edge) supports Bluetooth and it is enabled. .
2. Make sure your device (laptop, phone, etc) supports Bluetooth and that it is working and enabled..
3. Refresh the web page,unplug the Arduino power cable and then plug it back in to reset. , then try connecting again.

_NOTE: If you’re using a managed device, like a computer from school or work, your device policy may prevent BLE pairing._

**My board isn’t showing up on my computer, even though it’s plugged in. What should I do?**
Try unplugging the Arduino power cable and then plug it back in to reset. Make sure you see the RGB LED blink red, green, blue in a sequential order.

**The model isn’t getting my movements right. What do I do?**
The way you move may be different from the data we used to pre-train the model. Different people move differently. That’s why we created [Tiny Motion Trainer](https://experiments.withgoogle.com/tiny-motion-trainer/view "Tiny Motion Trainer"), which lets you train a custom model based on the way you move.

**Do you have plans to support other boards?**
We made these projects to work specifically with the Arduino Nano, and we currently don’t have plans to expand support. However, all of the code is open sourced, so you can remix or modify as needed.

**Where should I go from here if I want to make my own model or project?**
You can create your own model in several different ways. Check out these links:

- [Experiments Collection](https://experiments.withgoogle.com/collection/tfliteformicrocontrollers "Experiments Collection") - Inspiration and more resources
- [Tiny Motion Trainer](https://experiments.withgoogle.com/tiny-motion-trainer/view "Tiny Motion Trainer") - Code-free motion trainer for microcontrollers
- [Teachable Machine](https://teachablemachine.withgoogle.com/ "Teachable Machine") - Code-free image model trainer
- [Tensorflow Lite for Microcontrollers](https://www.tensorflow.org/lite/microcontrollers "Tensorflow Lite for Microcontrollers") - Full documentation
- [Free Harvard EdX Course](https://www.edx.org/professional-certificate/harvardx-tiny-machine-learning "Harvard X Course") - In-depth course on TensorFlow Lite for Microcontrollers and the TinyML Ecosystem

**"What sensors do the experiments use?"**
The IMU is a LSM9DS1. It is a 3-axis accelerometer, 3-axis gyroscope and 3-axis magnetometer. This chip, made by ST Microelectronics, is a standard component supported by our library ArduinoLSM9DS1. Read more here: https://www.arduino.cc/en/Guide/NANO33BLESense

**How do you shrink a TensorFlow model to fit on a microcontroller?**
Post-training quantization is a conversion technique that can reduce model size while also improving CPU and hardware accelerator latency, with little degradation in model accuracy. You can quantize an already-trained float TensorFlow model when you convert it to TensorFlow Lite format using the TensorFlow Lite Converter. Read more here: https://www.tensorflow.org/lite/performance/post_training_quantization

---

## Note

This is not an official Google product, but a collection of experiments that were developed at the Google Creative Lab. This is not a library or code repository that intends to evolve. Instead, it is a snapshot alluding to what’s possible at this moment in time.

We encourage open sourcing projects as a way of learning from each other. Please respect our and other creators’ rights, including copyright and trademark rights when present, when sharing these works and creating derivative work. If you want more info on Google's policy, you can find that [here.](https://about.google/brand-resource-center/ "Google Brand Resource Center")

---
