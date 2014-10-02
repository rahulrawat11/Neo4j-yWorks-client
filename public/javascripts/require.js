/****************************************************************************
 **
 ** This file is part of yFiles for HTML 1.2.0.3.
 ** 
 ** yWorks proprietary/confidential. Use is subject to license terms.
 **
 ** Copyright (c) 2014 by yWorks GmbH, Vor dem Kreuzberg 28, 
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ***************************************************************************/
/*
 This is a simple implementation of the AMD loading mechanism.

 This code is part of the demo sources of yFiles for HTML. It is not intended
 for production use. We recommend using a third party implementation of the
 AMD loading standard like the ones provided by http://dojotoolkit.org or
 http://requirejs.org.
 */
(function(global, undefined) {

  if(typeof global.require === "function") {
    // don't overwrite an existing require implementation
    return;
  }

  var dependencyState = {};
  var relativeLocationMatcher = /^\.\.?/;
  var jsFileMatcher = /\.js$/;
  var currentlyLoadedModule = null;
  var pathToCurrentlyLoadedModule = {};
  var pendingRequires = [];

  var currentImport = ""; // just for importScripts (loaded synchronously)
  var isWebWorker = typeof importScripts!=='undefined' && (typeof window == 'undefined' || typeof window.document == 'undefined');

  function importScript(path, context) {
    dependencyState[path] = {
      dependants: [context],
      state: 'pending'
    };

    try {
      currentImport = path;
      importScripts(path);
      scriptLoaded(path,context);
    } catch(e) {
      loadFailed(context,path,e);
    }
  }

  function loadFailed(context, path, e) {
    context.fail('Error loading ' + path);
    console.log('Error loading ' + path, e);
    dependencyState[path].state = 'failed';
  }

  function scriptLoaded(path,context) {
    var currentlyLoadedModuleLocal = pathToCurrentlyLoadedModule[path] || currentlyLoadedModule;
    dependencyState[path].state = 'loaded';
    if(currentlyLoadedModuleLocal) {
      currentlyLoadedModuleLocal.dependants = dependencyState[path].dependants;
      currentlyLoadedModuleLocal.name = path;
      currentlyLoadedModule = null;
      if (currentlyLoadedModuleLocal.failed) {
        currentlyLoadedModuleLocal.fail(currentlyLoadedModuleLocal.failed);
      } else {
        currentlyLoadedModuleLocal.resolve();
      }
    } else {
      var dependants = dependencyState[path].dependants;
      for(var i = 0; i < dependants.length; i++) {
        dependants[i].resolve();
      }
      dependencyState[path].state = 'executed';
    }
  }

  function loadScript(path, context, loader) {
    dependencyState[path] = {
      dependants: [context],
      state: 'pending'
    };
    var script = document.createElement('script');
    var timerId = -1;
    script.type = 'text/javascript';
    script.onload = function() {
      script.onload = undefined;
      scriptLoaded(path,context);
      clearTimeout(timerId);
      delete script['data-yworks-loading-state'];
    };
    script.onerror = function(e) {
      loadFailed(context,path,e);
      script.onload = undefined;
      clearTimeout(timerId);
    };
    timerId = setTimeout(function() {
      console.log('Timeout while trying to load '+path);
      script.onload = undefined;
      dependencyState[path].state = 'failed';
      context.fail('Timeout while trying to load '+path);
    }, require.timeout);
    script.src = path;
    script['data-yworks-module-path'] = path;
    if (!document.currentScript && !script.readyState) {
      // If we can use neither of the above properties to determine the current script, we have to evaluate them in
      // the given order to identify the path name in define(). This is especially for IE 11.
      // Note that only the evaluation of the scripts is async, the files are still loaded in parallel.
      script.async = false;
    }
    script['data-yworks-loading-state'] = "pending";
    loader.appendChild(script);
  }

  /**
   * @param dep {string} The dependency string.
   * @param context {*} The current context.
   * @returns {string} The path to the given dependency
   */
  function resolveDependency(dep, context) {
    if (jsFileMatcher.test(dep)) {
      return dep;
    } else if (!relativeLocationMatcher.test(dep)) {
      return normalizePath(context.baseUrl + dep + ".js");
    } else if (context.parentUrl) {
      return normalizePath(context.parentUrl + dep + ".js");
    } else {
      throw new Error("Mandatory base path is not specified!");
    }
  }

  /**
   * @param dep {string} The dependency string.
   * @returns {string} The path to the parent directory of the given dependency
   */
  function determineParentUrl(dep) {
    var lastIndexOf = dep.lastIndexOf("/");
    return lastIndexOf <= 0 ? "./" : dep.substr(0, lastIndexOf + 1);
  }

  /**
   * @param path {string}
   */
  function normalizePath(path) {
    var length = -1;
    while (path && length !== path.length) {
      length = path.length;
      // remove inner parent specifier '..'
      path = path.replace(/\/[\w\.-]+[\w-]\/\.\.\//, "/");
      // remove inner current directory specifier '/./' > '/'
      path = path.replace(/\/\.\//, "/");
    }
    return path;
  }


  global.require = function(deps, fn) {
    var anonRequire = {
      cancelled: false,
      unresolvedDependencyCount: 1,
      callback: fn,
      resolve: function() {
      if(!this.cancelled) {
        if(--this.unresolvedDependencyCount == 0) {
          if(this.errorHandler === null || global.require.disableErrorReporting) {
            this.callback();
          } else {
            try {
              this.callback();
            } catch(e) {
              this.fail(null, e);
            }
          }
          this.removePending();
        }
      }
      //else: Don't resolve if canceled
      },

      removePending: function() {
        pendingRequires = pendingRequires.filter(function(element) {
          return element != this;
        },this);
      },

      fail: function(cause, error) {
        if (this.errorHandler != null) {
          this.errorHandler(cause, error);
        } else {
          if (error) {
            console.log("Error occurred: "+error.message, error.stack, error);
          } else {
            console.log("Error occurred: " + cause);
          }
          if(global.yfiles && global.yfiles.demo && global.yfiles.demo.Application) {
            global.yfiles.demo.Application.handleError(error ? error : cause, "", "");
          } else {
            if(!isWebWorker) {
              var loader = document.getElementById("loader");
              if(loader && !global.require.disableErrorReporting) {
                loader.innerHTML = "<h1>An error occured, starting the application failed.</h1>"
                    + "<p>Please review the error message in your browsers developer tools.</p>";
                loader.className += " error";
              }
            }
          }
        }
      }
    };
    anonRequire.errorHandler = require.errorHandler;
    var context = { 'parentUrl': require.baseUrl, 'baseUrl': require.baseUrl };
    pendingRequires.push(anonRequire);

    for(var i = 0, length = deps.length; i < length; i++) {
    var dependency = resolveDependency(deps[i], context);
      if(dependencyState.hasOwnProperty(dependency)) {
        var module = dependencyState[dependency];
        if(module.state == 'pending'  || module.state == "loaded" || module.state == "resolved") {
          anonRequire.unresolvedDependencyCount++;
          module.dependants.push(anonRequire);
        } else if (module.state == 'failed') {
          anonRequire.unresolvedDependencyCount++;
          anonRequire.fail(dependency + " could not be resolved due to a previous error.");
        }
        // else module is already loaded, don't need to do anything
      } else {
        // load dependency
        anonRequire.unresolvedDependencyCount++;
        load(dependency, anonRequire);
      }
    }
    // make sure that we call the callback if everything is resolved
    anonRequire.resolve();
  };

  function load(path, context) {
    if(!isWebWorker) {
      loadScript(path, context, document.head);
    } else {
      importScript(path,context);
    }
  }

  /**
   * Cancel all pending requires
   * (prevent execution of the corresponding require callbacks)
   */
  global.cancelRequire = function() {
    while(pendingRequires.length>0) {
      pendingRequires.pop().cancelled = true;
    }
  };

  global.define = function(modulenameopt, deps, fn) {
    if (typeof modulenameopt !== "string"){
      fn = deps;
      deps = modulenameopt;
      modulenameopt = undefined;
    }


    var clm = currentlyLoadedModule = {
      callback: fn,
      dependants: [],
      dependencyNames: [],
      unresolvedDependencyCount: 0,

      resolve: function() {
        if(this.unresolvedDependencyCount == 0) {
          dependencyState[this.name].state = "resolved";
          dependencyState[this.name].deps = this.dependencyNames;
          try {
            this.callback();
            dependencyState[this.name].state = "defined";
          } catch(e) {
            this.fail("Error initializing module " + this.name + ": " + e.message, e, true);
            console.log(e);
            return;
          }
          for(var i = 0; i < this.dependants.length; i++) {
            this.dependants[i].resolve();
          }
        }
        this.unresolvedDependencyCount--;
      },
      fail: function(cause, error, notext) {
        if (this.name) {
          if (cause && !notext) {
            cause = "Requiring module " + this.name + " failed. Cause:\n" + (cause ? cause : error);
          }
          dependencyState[this.name].state = "failed";
        }
        for(var i = 0; i < this.dependants.length; i++) {
          this.dependants[i].fail(cause, error);
        }
      }
    };
    var length, i, path;
    if (modulenameopt){
      pathToCurrentlyLoadedModule[modulenameopt] = currentlyLoadedModule;
      currentlyLoadedModule = null;
      path = modulenameopt;
    } else {
      // no name set, use the currentScript
      if(!isWebWorker) {
        if (document.currentScript) {
          path = document.currentScript['data-yworks-module-path'];
        }
        // still no name, find out name for IE < 11 (readyState) or other browsers
        if (!path) {
          var children = document.head.children;
          for (i = 0, length = children.length; i < length; i++){
            var child = children[i];
            // if readyState is defined, we're looking for the script with 'interactive' state, otherwise use the first one that is marked with our custom attribute
            if (child.src && (child.readyState == "interactive" || (!child.readyState && child['data-yworks-loading-state'] === "pending"))){
              path = child['data-yworks-module-path'];
              if (path){
                break;
              }
            }
          }
        }
      } else {
        path = currentImport;
      }
      if (path && path.length>0){
        pathToCurrentlyLoadedModule[path] = clm;
        currentlyLoadedModule = null;
      }
    }

    var context = { 'parentUrl': path ? determineParentUrl(path) : require.baseUrl, 'baseUrl': require.baseUrl };
    for(var i = 0, length = deps.length; i < length; i++) {
      var dependency = resolveDependency(deps[i], context);
      if(dependencyState.hasOwnProperty(dependency)) {
        var module = dependencyState[dependency];
        if(module.state == 'pending' || module.state == "loaded" || module.state == "resolved" || module.state == "failed") {
          clm.unresolvedDependencyCount++;
          module.dependants.push(clm);
          if (module.state == 'failed') {
            clm.failed = dependency + " could not be resolved due to a previous error.";
          }
        }
        // else module is already loaded, don't need to do anything
      } else {
        // load dependency
        clm.unresolvedDependencyCount++;
        load(dependency, clm);
      }
      clm.dependencyNames.push(dependency);
    }
  };

  // some configuration
  require.timeout = 400000;
  require.baseUrl = '';
  require.load = require;
  require.disableErrorReporting = false;
  require.getRequiredModuleStates = function() {
    var modules = [];
    Object.getOwnPropertyNames(dependencyState).forEach(function(moduleName) {
      var state = dependencyState[moduleName];
      var info = { name: moduleName, state: state.state, dependencies:[] };
      if (state.deps){
        for(var i = 0; i < state.deps.length; i++) {
          info.dependencies.push(state.deps[i]);
        }
      }
      modules.push(info);
    });
    return modules;
  };
}(this));
