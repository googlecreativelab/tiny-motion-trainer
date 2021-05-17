# Internal Instructions

After checking out the this repo, create a dev branch for your project:

`git checkout -b your-experiment-name/dev`

and a folder (if it doesn't exist already):

`mkdir your-experiment-name`

Use the same name on the remote. So for your initial push:

`git push -u origin your-experiment-name/dev`

Any subsequent push can be run with `git push` when you're on your branch.

Use the branch and folder to develop your experiment. If you create more branches, prefix them with <your-experiment-name>/. So for example: ml-drumsticks/feature/my-new-feature

# Overview
Tensorflow Micro Experiments is a collection of open source, interactive projects designed to demonstrate some fun ways to combine Arduino and Tensorflow Lite for Microcontrollers. The projects include:

- Air Snare lets you play the drums in the air. Using an Arduino, IMU sensor and Tensorflow we trained a tiny machine learning model to recognize a range of drumming motions that map to an invisible drum kit. 

- Finger User Interface or FUI ( pronounced Foo-ey ) lets you control a web UI with the wave of a finger. 

- Alchemy lets you cast spells with a machine learning powered magic wand. 

- Astrowand lets you draw shapes in the air to form constellations.  

- Tiny Motion Trainer is a code free tool that lets you create custom models based on IMU data that can be deployed to a microcontroller. 

These projects were built with the Arduino Sense 33 BLE, Tensorflow Lite for Microcontrollers, standard web technologies ( HTML, CSS & Javascript ) and P5js. 

This is not an official Google product, but a collection of experiments that were developed at the Google Creative Lab. This is not a library or code repository that intends to evolve. Instead, it is a snapshot alluding to what’s possible at this moment in time. 

# What you'll need

- Linux, MacOS or Windows computer with Chrome installed
- Tensorflow Microcontroller Challenge Kit by Sparkfun or Arduino Nano BLE Sense 33
- Micro USB cable (If you're on a USB-C laptop, instead get a USB-C to Micro USB cable)

# Getting Started

##Using the Tensorflow Microcontroller Challenge Kit by Spark Fun

The board that comes with this kit comes preflashed with a sketch that will work with some of the experiments right out of the box. If you are using one of the “Tensorflow Micro Challenge” kits and you just want to jump right into playing with the experiments then you can simply connect you arduino to a power source ( USB or Battery ) and connect to one of the following experiment URLs:
- Air Snare
- Finger User Interface ( FUI )
- Tiny Motion Trainer

To access the additional experiments (Alchemy and Astrowand) follow the instructions in the “Using the Arduino Nano Sense 33 BLE” section below.
 
##Using the Arduino Nano Sense 33 BLE (Unflashed)

1. Install the Arduino IDE
2. Setup Arduino board (Tools > Board: > Boards Manager…) 
	- Arduino mbed-enabled Boards (BLE)
3. Install Arduino libraries (Tools > Manage Libraries…)
	- Arduino_APDS9960
	- Arduino_LSM9DS1
	- ArduinoBLE
	- Arduino_TensorFlowLite

4. Upload the experiment sketch and model to the board (File > Examples > Arduino_TensorFlowLite > [ project-name])
	- Air Snare
	- Alchemy
	- Astrowand
	- Finger User Interface ( FUI )
	- Tiny Motion Trainer


5. Go to the URL related to the experiment. The URL can be found below or commented at the top of the sketch.
	- Air Snare
	- Alchemy
	- Astrowand
	- Finger User Interface ( FUI )
	- Tiny Motion Trainer
 
