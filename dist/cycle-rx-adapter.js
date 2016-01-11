(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rx = (typeof window !== "undefined" ? window['Rx'] : typeof global !== "undefined" ? global['Rx'] : null);

var streamTypeErrorMsg = function streamTypeErrorMsg(lib) {
  return 'Stream provided is not a ' + lib + ' stream';
};

function logToConsoleError(err) {
  var target = err.stack || err;
  if (console && console.error) {
    console.error(target);
  }
}

var rxAdapter = {
  replaySubject: function replaySubject() {
    var stream = new _rx.ReplaySubject(1);
    var sink = {
      next: function next(x) {
        return stream.onNext(x);
      },
      complete: function complete(x) {
        return stream.onCompleted(x);
      },
      error: function error(x) {
        return stream.onError(x);
      }
    };
    return { sink: sink, stream: stream };
  },
  dispose: function dispose(sinks, sinkProxies, sources) {
    Object.keys(sources).forEach(function (k) {
      if (typeof sources[k].dispose === 'function') {
        sources[k].dispose();
      }
    });
    Object.keys(sinkProxies).forEach(function (k) {
      sinkProxies[k].sink.complete();
    });
  },
  replicate: function replicate(stream, sink) {
    stream.subscribe(function (x) {
      return sink.next(x);
    }, function (x) {
      logToConsoleError(x);
      sink.error(x);
    }, function (x) {
      return sink.complete(x);
    });
  },
  isValidStream: function isValidStream(stream) {
    if (typeof stream.subscribe !== 'function' || //should have .subscribe
    typeof stream.onValue === 'function') // make sure not baconjs
      {
        return false;
      }
    return true;
  },
  error: function error() {
    throw new Error(streamTypeErrorMsg('rx'));
  },
  streamSubscription: function streamSubscription(stream, sink) {
    stream.subscribe(function (x) {
      return sink.add(x);
    }, function (x) {
      return sink.error(x);
    }, function (x) {
      return sink.end(x);
    });
  },
  toAdapterStream: function toAdapterStream(stream, streamSubscription) {
    if (rxAdapter.isValidStream(stream)) {
      return stream;
    }
    return _rx.Observable.create(function (observer) {
      var sink = {
        add: function add(x) {
          return observer.onNext(x);
        },
        end: function end(x) {
          return observer.onCompleted(x);
        },
        error: function error(x) {
          return observer.onEnd(x);
        }
      };
      streamSubscription(stream, sink);
    });
  }
};

exports.default = rxAdapter;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);