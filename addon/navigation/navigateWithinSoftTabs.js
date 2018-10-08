(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineOption("navigateWithinSoftTabs", null, function (cm, val, old) {
    var prev = old == CodeMirror.Init ? null : old;
    if (val == prev) return
    if (prev) {
      // turn off navigation
      cm.off("keydown", onKeyDown);
      cm.off('cursorActivity', cursorActivity);
      cm.state.navigateWithinSoftTabs = {};
    }
    if (val) {
      // turn on navigation
      cm.on("keydown", onKeyDown);
      cm.on('cursorActivity', cursorActivity);
      cm.state.navigateWithinSoftTabs = {
        tabSize: null,
        startPos: null,
        direction: null
      };
    }
  });

  function update(cmInstance) {
    // event sent from
    if (!event) {
      return;
    }
    var state = cmInstance.state.navigateWithinSoftTabs;
    var isSelection = cmInstance.somethingSelected();
    if (event.which !== 37 && event.which !== 39) {
      return;
    }
    var start = state.startPos;
    var end = cmInstance.findPosH(start, state.direction, "column");
    var range = "";
    if (start.ch % state.tabSize !== 0) {
      return;
    }
    if (state.direction >= 0) {
      range = cmInstance.doc.getRange(start, end);
    } else {
      range = cmInstance.doc.getRange(end, start);
    }
    var canJump = range.split(" ").length - 1 === state.tabSize;
    if (canJump) {
      event.preventDefault();
      if (isSelection) {
        cmInstance.extendSelection(end);
      } else {
        cmInstance.setCursor(end);
      }
    }
  }

  function cursorActivity(cmInstance) {
    cmInstance.operation(function (){ update(cmInstance); });
  }

  function onKeyDown(cmInstance, event) {
    var state = cmInstance.state.navigateWithinSoftTabs;
    state.tabSize = cmInstance.options.tabSize;
    state.direction = state.tabSize;
    if (event.which === 37 || event.which === 39) {
      if (event.which === 37) {
        state.direction = -(state.tabSize);
      }
      state.startPos = cmInstance.getCursor();
    } else {
      return;
    }
  }
});