/* Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

class EventHandler {
  constructor(...eventNames) {
    this.eventListeners = {};
    this.propagation = [];
    eventNames.forEach((eventName) => {
      this.addEventName(eventName);
    });
  }

  _checkEvent(eventName){
    if (!this.eventListeners[eventName]) {
      throw new Error(
        `No event named ${eventName}. Availible events are ${Object.keys(
          this.eventListeners
        ).join(', ')}`
      );
    }
  }

  addEventListener(eventName, callback) {
    this._checkEvent(eventName);
    this.eventListeners[eventName].push(callback);
    return ()=>{
      this.removeEventListener(eventName, callback);
    }
  }

  removeEventListener(eventName, callback) {
    this._checkEvent(eventName);
    this.eventListeners[eventName] = this.eventListeners[eventName].filter(
      (cb) => cb !== callback
    );
  }

  once(eventName, callback){
    const unsub = this.addEventListener(eventName, (...args)=>{
      callback(...args);
      unsub();
    });
  }

  dispatchEvent(eventName, data) {
    this._checkEvent(eventName);
    this.eventListeners[eventName].forEach((cb) => cb(data));
    this.propagation.forEach(listener=>listener.dispatchEvent(eventName, data));
  }

  addEventName(name){
    this.eventListeners[name] = this.eventListeners[name] || [];
  }
  
  propagateTo(eventHandler){
    this.propagation.push(eventHandler);
    Object.keys(this.eventListeners).forEach((name)=>eventHandler.addEventName(name));
  }
}

export default EventHandler;
