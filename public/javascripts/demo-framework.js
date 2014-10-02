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
(typeof define=='function'?define:(function(dependencies,f){f();}))(['yfiles/lang'],function(){(function(window)  {

yfiles.module("demo", function(exports) {
  /**
   * @class demo.ActionCommand
   * @implements {yfiles.system.ICommand}
   */
  exports.ActionCommand = new yfiles.ClassDefinition(function() {
    /** @lends {demo.ActionCommand.prototype} */
    return {
      
      '$with': [yfiles.system.ICommand],
      
      'constructor': function(/**function()*/ action) {
        this.action = action;
      },
      
      /**
       * @type {function()}
       * @private
       */
      'action': null,
      
      /**
       * Backing field for below event.
       * @type {function(Object, yfiles.system.EventArgs)}
       * @private
       */
      '$canExecuteChangedEvent': null,
      
      'addCanExecuteChangedListener': function(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = yfiles.lang.delegate.combine(this.$canExecuteChangedEvent, value);
      },
      
      'removeCanExecuteChangedListener': function(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = yfiles.lang.delegate.remove(this.$canExecuteChangedEvent, value);
      },
      
      'execute': function(/**Object*/ parameter) {
        this.action();
      },
      
      /** @return {boolean} */
      'canExecute': function(/**Object*/ parameter) {
        return true;
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @class demo.ApplicationCommand
   * @implements {yfiles.system.ICommand}
   */
  exports.ApplicationCommand = new yfiles.ClassDefinition(function() {
    /** @lends {demo.ApplicationCommand.prototype} */
    return {
      
      '$with': [yfiles.system.ICommand],
      
      'constructor': function(/**yfiles.system.RoutedUICommand*/ uiCommand, /**yfiles.canvas.Control*/ target) {
        this.uiCommand = uiCommand;
        this.target = target;

        uiCommand.addCanExecuteChangedListener(yfiles.lang.delegate(this.uiCommand_CanExecuteChanged, this));
      },
      
      /**
       * @type {yfiles.system.RoutedUICommand}
       * @private
       */
      'uiCommand': null,
      
      /**
       * @type {yfiles.canvas.Control}
       * @private
       */
      'target': null,
      
      /** @type {Object} */
      'parameter': null,
      
      'dispose': function() {
        this.uiCommand.removeCanExecuteChangedListener(yfiles.lang.delegate(this.uiCommand_CanExecuteChanged, this));
      },
      
      /** @private */
      'uiCommand_CanExecuteChanged': function(/**Object*/ sender, /**yfiles.system.EventArgs*/ e) {
        if (this.$canExecuteChangedEvent !== null) {
          this.$canExecuteChangedEvent(sender, e);
        }
      },
      
      /**
       * Backing field for below event.
       * @type {function(Object, yfiles.system.EventArgs)}
       * @private
       */
      '$canExecuteChangedEvent': null,
      
      'addCanExecuteChangedListener': function(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = yfiles.lang.delegate.combine(this.$canExecuteChangedEvent, value);
      },
      
      'removeCanExecuteChangedListener': function(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$canExecuteChangedEvent = yfiles.lang.delegate.remove(this.$canExecuteChangedEvent, value);
      },
      
      'execute': function(/**Object*/ ignored) {
        this.uiCommand.executeOnTarget(this.parameter, this.target);
      },
      
      /** @return {boolean} */
      'canExecute': function(/**Object*/ ignored) {
        return this.uiCommand.canExecuteOnTarget(this.parameter, this.target);
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * Base class for yFiles for HTML demo applications.
   * @class demo.Application
   * @abstract
   */
  exports.Application = new yfiles.ClassDefinition(function() {

    /** @return {Element} */
    function addFormRow(/**Element*/ form, /**string*/ id, /**string*/ label, /**string*/ type, /**string*/ value) {
      var /**Element*/ labelElement = document.createElement("label");
      labelElement.setAttribute("for", "error_dialog_" + id);
      ((/**@type {HTMLElement}*/(labelElement))).innerHTML = label;
      var /**Element*/ input = document.createElement("textarea".equals(type) ? "textarea" : "input");
      if (!"textarea".equals(type)) {
        input.setAttribute("type", type);
        input.setAttribute("value", value);
      } else {
        ((/**@type {HTMLTextAreaElement}*/(input))).value = value;
      }
      input.setAttribute("id", "error_dialog_" + id);
      input.setAttribute("name", "error_dialog_" + id);
      form.appendChild(labelElement);
      form.appendChild(input);
      return input;
    };

    function addHiddenField(/**Element*/ form, /**string*/ id, /**string*/ value) {
      var /**Element*/ input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("value", value);
      input.setAttribute("id", "error_dialog_" + id);
      input.setAttribute("name", "error_dialog_" + id);
      form.appendChild(input);
    };

    /** @lends {demo.Application.prototype} */
    return {
      '$abstract': true,
      
      /**
       * Called after this application has been set up by the demo framework.
       */
      'loaded': yfiles.lang.Abstract,
      
      /**
       * Registers the Javascript commands for the GUI elements, typically the
       * tool bar buttons, during the creation of this application.
       */
      'registerCommands': function() {},
      
      'setProperty': function(/**string*/ name, /**Object*/ value) {
        this[name] = value;
      },
      
      /** @return {Object} */
      'getProperty': function(/**string*/ name) {
        var property = this[name];
        return (property) ? property : null;
      },
      
      'setTitle': function(/**string*/ title) {
        document.title = title;
      },
      
      /**
       * Reads a graph from the given filename.
       * @param {yfiles.graph.IGraph} graph The graph.
       * @param {string} filename The filename
       * @param {function(Object, yfiles.graphml.ParseEventArgs)} afterParsing A function that is called after the parsing. Can be null.
       * @return {boolean} false iff we did not succeed at all
       */
      'readGraph': function(/**yfiles.graph.IGraph*/ graph, /**string*/ filename, /**function(Object, yfiles.graphml.ParseEventArgs)*/ afterParsing) {
        graph.clear();
        var /**yfiles.graphml.GraphMLIOHandler*/ ioHandler = this.createGraphMLIOHandler();
        ioHandler.addParsedListener(afterParsing);
        try {
          ioHandler.readFromURL(graph, filename);
          return true;
        } catch ( /**yfiles.lang.Exception*/ e ) {
          {
            var /**Object*/ error = (/**@type {Object}*/(e));
            var /**string*/ message = "Unable to open the graph.\nPerhaps your browser does not allow handling cross domain HTTP requests. Please see the demo readme for details.";
            if ((error["message"])) {
              message += "\n" + error["message"] + "\n";
            }
            alert(message);
            return false;
          }
        }
      },
      
      /** @return {yfiles.graphml.GraphMLIOHandler} */
      'createGraphMLIOHandler': function() {
        return new yfiles.graphml.GraphMLIOHandler();
      },
      
      /** @lends {demo.Application} */
      '$static': {
        /**
         * Starts the creation of the given yFiles for HTML demo application.
         * This method creates the GUI widgets specified in the base HTML file,
         * then invokes {@link demo.Application#registerCommands} and finally
         * {@link demo.Application#loaded}.
         * @param {demo.Application} application The demo application to create.
         * @param {Object} appRootOrId The root element of the application, either the element itself or its ID.
         * @param {Object} config Configuration settings.
         */
        'start': function(/**demo.Application*/ application, /**Object*/ appRootOrId, /**Object*/ config) {
          var /**string*/ catchErrors = (/**@type {string}*/(config["catchErrors"]));
          if ("true".equals(catchErrors)) {
            yfiles.system.ErrorHandling.catchErrors = true;
            yfiles.system.ErrorHandling.errorHandler = function(/**Object*/ e) {
              demo.Application.handleError(e, "", 0);
            };
            window.onerror = demo.Application.handleError;
          }

          var /**Element*/ appRoot;
          if (yfiles.lang.String.$class.isInstance(appRootOrId)) {
            appRoot = document.getElementById((/**@type {string}*/(appRootOrId)));
          } else {
            appRoot = (/**@type {Element}*/(appRootOrId));
          }
          var /**demo.IApplicationParserBackend*/ backend = demo.BackendFactory.getBackend((/**@type {string}*/(config["backend"])));

          var /**system.Action*/ callback = function() {
            try {
              var /**demo.ApplicationParser*/ appConverter = new demo.ApplicationParser();
              appConverter.application = application;
              appConverter.backend = backend;

              var /**demo.IApplicationFrame*/ frame = appConverter.parseApplication(appRoot);
              var loaderId = config["loaderId"];
              if (!"undefined".equals(typeof(loaderId))) {
                ((/**@type {HTMLElement}*/(document.getElementById((/**@type {string}*/(loaderId)))))).style.setProperty("display", "none", "");
              }
              application.registerCommands();
              appConverter.bindCommands(frame);
              application.loaded();
              var loadedCallback = config["loadedCallback"];
              if (!"undefined".equals(typeof(loadedCallback))) {
                ((/**@type {system.Action}*/(loadedCallback)))();
              }
              setTimeout(function() {
                var appStatus = window["yFilesAppStatus"];
                if (appStatus === undefined) {
                  window["yFilesAppStatus"] = "OK";
                }
              }, 10000);
            } catch ( /**Error*/ e ) {
              if (e instanceof Error) {
                if ("true".equals(catchErrors)) {
                  demo.Application.handleError(e, "", 0);
                } else {
                  //Rethrow
                  throw e;
                }
              } else if (e instanceof yfiles.lang.Exception) {
                if ("true".equals(catchErrors)) {
                  demo.Application.handleError(e, "", 0);
                } else {
                  //Rethrow
                  throw e;
                }
              } else {
                throw e;
              }
            }
          };
          if ("complete".equals(document.readyState) || "interactive".equals(document.readyState)) {
            callback();
          } else {
            backend.addOnLoadCallback(callback);
          }
        },
        
        /** @return {boolean} */
        'handleError': function(/**Object*/ error, /**string*/ url, /**number*/ lineNumber) {
          // create outer div & form element
          var /**Element*/ formDialog = document.createElement("div");
          demo.ElementExtensions.addClass(demo.ElementExtensions.addClass(formDialog, "demo-dialog"), "demo-error-dialog");
          var /**Element*/ title = document.createElement("h2");
          ((/**@type {HTMLElement}*/(title))).innerHTML = "Report error to yWorks";
          formDialog.appendChild(title);
          var /**HTMLFormElement*/ form = (/**@type {HTMLFormElement}*/(document.createElement("form")));
          form.setAttribute("method", "POST");
          form.setAttribute("target", "_blank");
          form.setAttribute("action", "http://kb.yworks.com/errorFeedback.html");
          var /**EventListener*/ submitHandler = function(/**Event*/ evt) {
            form.submit();
            document.body.removeChild(formDialog);
          };
          var /**EventListener*/ cancelHandler = function(/**Event*/ evt) {
            document.body.removeChild(formDialog);
          };
          formDialog.appendChild(form);

          // create form element
          addHiddenField(form, "exact_product", yfiles.productname);
          addHiddenField(form, "version", yfiles.version);
          addFormRow(form, "email", "E-Mail <span class=\"optional\">In case we need to contact you</span>", "text", "");
          ((/**@type {HTMLTextAreaElement}*/(addFormRow(form, "system", "System Info", "textarea", "appVersion: " + window.navigator.appVersion + "\nVendor: " + window.navigator.vendor + "\nOS: " + window.navigator.platform + "\nuserAgent: " + window.navigator.userAgent)))).rows = 3;
          addFormRow(form, "url", "URL", "text", window.location.href);
          if (yfiles.lang.String.$class.isInstance(error)) {
            addFormRow(form, "error_message", "Error Message", "text", (/**@type {string}*/(error)));
            addFormRow(form, "file", "File", "text", url);
            addFormRow(form, "linenumber", "Line number", "text", lineNumber + "");
          } else {
            var /**Object*/ err = (/**@type {Object}*/(error));
            var message = err["message"];
            var stack = err["stacktrace"] !== undefined ? err["stacktrace"] : err["stack"];
            var line = err["line"];
            var source = err["sourceURL"];
            if (message !== undefined) {
              addFormRow(form, "error_message", "Error Message", "text", (/**@type {string}*/(message)));
            }
            if (stack !== undefined) {
              ((/**@type {HTMLTextAreaElement}*/(addFormRow(form, "stack", "Stack trace", "textarea", (/**@type {string}*/(stack)))))).rows = 3;
            }
            if (line !== undefined) {
              addFormRow(form, "error_line", "Error Line", "text", (/**@type {string}*/(line)));
            }
            if (source !== undefined) {
              addFormRow(form, "error_source", "Error Source", "text", (/**@type {string}*/(source)));
            }
          }

          ((/**@type {HTMLTextAreaElement}*/(addFormRow(form, "comment", "Additional Comments", "textarea", "")))).rows = 3;
          // if yFiles for HTML require.js was used to load modules, also add information about the loaded modules
          var /**Object*/ require = window["require"];
          if (!"undefined".equals(typeof(require)) && !"undefined".equals(typeof(require["getRequiredModuleStates"]))) {
            var /**string*/ moduleInfoText = "";
            var /**string*/ definedModules = "";
            var /**system.Func.<yfiles.lang.ModuleInfo[]>*/ f = (/**@type {system.Func.<yfiles.lang.ModuleInfo[]>}*/((require["getRequiredModuleStates"])));
            var /**yfiles.lang.ModuleInfo[]*/ arr;
            var /**number*/ i;
            for (i = 0, arr = f(); i < arr.length; i++) {
              var /**yfiles.lang.ModuleInfo*/ moduleInfo = arr[i];
              if ("defined".equals(moduleInfo.state)) {
                definedModules += moduleInfo.name + "\n";
              } else {
                moduleInfoText += moduleInfo.name + ": " + moduleInfo.state + "\n";
              }
            }
            if (definedModules.length > 0) {
              moduleInfoText += "Defined:\n" + definedModules;
            }
            if (moduleInfoText.length > 0) {
              moduleInfoText = moduleInfoText.substr(0, moduleInfoText.length - 1);
            }

            ((/**@type {HTMLTextAreaElement}*/(addFormRow(form, "loaded_modules", "Loaded Modules", "textarea", moduleInfoText)))).rows = 3;
          }

          var /**Element*/ submitButton = document.createElement("input");
          submitButton.setAttribute("type", "button");
          demo.ElementExtensions.addClass(submitButton, "demo-submit-button");
          submitButton.setAttribute("value", "Submit");
          submitButton.addEventListener("click", submitHandler, false);
          form.appendChild(submitButton);

          var /**Element*/ cancelButton = document.createElement("input");
          cancelButton.setAttribute("type", "reset");
          cancelButton.addEventListener("click", cancelHandler, false);
          demo.ElementExtensions.addClass(cancelButton, "demo-cancel-button");
          cancelButton.setAttribute("value", "Cancel");
          form.appendChild(cancelButton);
          document.body.appendChild(formDialog);

          window["yFilesAppStatus"] = error.toString();
          return true;// prevent default
        },
        
        'removeAllChildren': function(/**HTMLElement*/ element) {
          if (element.children !== undefined) {
            var /**number*/ n = element.children.length;
            for (var /**number*/ i = 0; i < n; i++) {
              var /**Element*/ child = (/**@type {Element}*/(element.children[0]));
              element.removeChild(child);
            }
          }
        }
        
      }
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @class demo.ElementExtensions
   */
  exports.ElementExtensions = new yfiles.ClassDefinition(function() {
    /** @lends {demo.ElementExtensions.prototype} */
    return {
      
      /** @lends {demo.ElementExtensions} */
      '$static': {
        /** @return {Element} */
        'addClass': function(/**Element*/ e, /**string*/ className) {
          var /**string*/ classes = e.getAttribute("class");
          if (classes === null || yfiles.system.StringExtensions.stringEquals("", classes)) {
            e.setAttribute("class", className);
          } else if (!demo.ElementExtensions.hasClass(e, className)) {
            e.setAttribute("class", classes + ' ' + className);
          }
          return e;
        },
        
        /** @return {Element} */
        'removeClass': function(/**Element*/ e, /**string*/ className) {
          var /**string*/ classes = e.getAttribute("class");
          if (classes !== null && !yfiles.system.StringExtensions.stringEquals("", classes)) {
            if (yfiles.system.StringExtensions.stringEquals(classes, className)) {
              e.setAttribute("class", "");
            } else {
              var /**string*/ result = "";
              var /**string[]*/ arr;
              var /**number*/ i;
              for (i = 0, arr = yfiles.system.StringExtensions.split(classes, [' ']); i < arr.length; i++) {
                var /**string*/ s = arr[i];
                if (yfiles.system.StringExtensions.isNotEqual(s, className)) {
                  result += result.length === 0 ? s : " " + s;
                }
              }
              e.setAttribute("class", result);
            }
          }
          return e;
        },
        
        /** @return {boolean} */
        'hasClass': function(/**Element*/ e, /**string*/ className) {
          var /**string*/ classes = e.getAttribute("class");
          var /**RegExp*/ r = new RegExp("\b" + className + "\b", "");
          return r.test(classes);
        }
        
      }
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IComboBox
   * @implements {demo.ICommandComponent}
   */
  exports.IComboBox = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IComboBox.prototype} */
    return {
      '$with': [demo.ICommandComponent],
      
      /** @return {string} */
      'elementAt': yfiles.lang.Abstract,
      
      /** @type {yfiles.collections.IEnumerable.<string>} */
      'items': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {number} */
      'length': {
        'get': yfiles.lang.Abstract
      },
      
      /** @type {number} */
      'selectedIndex': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {string} */
      'selectedItem': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.ITextArea
   * @implements {demo.IComponent}
   */
  exports.ITextArea = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.ITextArea.prototype} */
    return {
      '$with': [demo.IComponent],
      
      /** @type {string} */
      'text': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @class demo.LayoutDirection
   */
  exports.LayoutDirection = new yfiles.EnumDefinition(function() {
    /** @lends {demo.LayoutDirection.prototype} */
    return {
      'VERTICAL': 0,
      'HORIZONTAL': 1,
      'UNKNOWN': 2
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.ICommandComponent
   * @implements {demo.IComponent}
   */
  exports.ICommandComponent = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.ICommandComponent.prototype} */
    return {
      '$with': [demo.IComponent],
      
      /** @type {yfiles.system.ICommand} */
      'command': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {Object} */
      'commandParameter': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {yfiles.canvas.Control} */
      'commandTarget': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {boolean} */
      'enabled': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      'addEventListener': yfiles.lang.Abstract,
      
      'removeEventListener': yfiles.lang.Abstract
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IButton
   * @implements {demo.ICommandComponent}
   */
  exports.IButton = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IButton.prototype} */
    return {
      '$with': [demo.ICommandComponent],
      
      /** @type {string} */
      'label': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {string} */
      'icon': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IToggleButton
   * @implements {demo.IButton}
   */
  exports.IToggleButton = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IToggleButton.prototype} */
    return {
      '$with': [demo.IButton],
      
      /** @type {boolean} */
      'isChecked': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IToolBar
   * @implements {demo.IContainer}
   */
  exports.IToolBar = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IToolBar.prototype} */
    return {
      '$with': [demo.IContainer],
      
      /** @return {demo.ISeparator} */
      'addSeparator': yfiles.lang.Abstract,
      
      /** @return {demo.IButton} */
      'addButton': yfiles.lang.Abstract
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @class demo.ContextMenu
   * @implements {demo.IContextMenu}
   * @implements {yfiles.input.IContextMenu}
   */
  exports.ContextMenu = new yfiles.ClassDefinition(function() {
    /** @lends {demo.ContextMenu.prototype} */
    return {
      
      '$with': [demo.IContextMenu, yfiles.input.IContextMenu],
      
      'constructor': function() {
        this.closeOnClick = (function(/**Event*/ evt) {
          this.visible = false;
        }).bind(this);
        this.peer = demo.BackendFactory.currentBackend.toolkit.createContextMenu();
      },
      
      /**
       * @type {demo.IContextMenu}
       * @private
       */
      'peer': null,
      
      /** @type {Element} */
      'element': {
        'get': function() {
          return this.peer.element;
        }
      },
      
      'setSize': function(/**yfiles.geometry.SizeD*/ newSize) {
        this.peer.setSize(newSize);
      },
      
      'setSizeWithUnit': function(/**yfiles.geometry.SizeD*/ newSize, /**string*/ unit) {
        this.peer.setSizeWithUnit(newSize, unit);
      },
      
      'setLocation': function(/**yfiles.geometry.PointD*/ location) {
        this.peer.setLocation(location);
      },
      
      'setBounds': function(/**yfiles.geometry.RectD*/ bounds) {
        this.peer.setBounds(bounds);
      },
      
      /** @return {demo.ElementDimensions} */
      'getDimensions': function() {
        return this.peer.getDimensions();
      },
      
      'setStyleProperty': function(/**string*/ propertyName, /**string*/ value) {
        this.peer.setStyleProperty(propertyName, value);
      },
      
      /** @type {yfiles.collections.IEnumerable.<demo.IComponent>} */
      'children': {
        'get': function() {
          return this.peer.children;
        }
      },
      
      'add': function(/**demo.IComponent*/ child) {
        this.peer.add(child);
      },
      
      'remove': function(/**demo.IComponent*/ child) {
        this.peer.remove(child);
      },
      
      'layoutChildren': function() {
        this.peer.layoutChildren();
      },
      
      /** @type {yfiles.geometry.PointD} */
      'location': {
        'get': function() {
          return this.peer.location;
        },
        'set': function(/**yfiles.geometry.PointD*/ value) {
          this.peer.location = value.clone();
        }
      },
      
      /** @type {boolean} */
      'visible': {
        'get': function() {
          return this.peer.visible;
        },
        'set': function(/**boolean*/ value) {
          this.peer.visible = value;
          if (value) {
            this.invokeOpened();
          } else {
            this.invokeClosed();
          }
        }
      },
      
      /** @return {demo.ISeparator} */
      'addSeparator': function() {
        return this.peer.addSeparator();
      },
      
      /** @return {demo.IButton} */
      'createMenuItem': function(/**string*/ label) {
        return this.peer.createMenuItem(label);
      },
      
      'install': function(/**Element*/ element) {
        element.addEventListener("contextmenu", (function(/**Event*/ evt) {
          evt.preventDefault();
          var /**MouseEvent*/ mouseEvent = (/**@type {MouseEvent}*/(evt));
          this.showAt(new yfiles.geometry.PointD(mouseEvent.pageX, mouseEvent.pageY));
        }).bind(this), false);
      },
      
      /**
       * Backing field for below event.
       * @type {function(Object, yfiles.system.EventArgs)}
       * @private
       */
      '$openedEvent': null,
      
      'addOpenedListener': function(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$openedEvent = yfiles.lang.delegate.combine(this.$openedEvent, value);
      },
      
      'removeOpenedListener': function(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$openedEvent = yfiles.lang.delegate.remove(this.$openedEvent, value);
      },
      
      /**
       * Backing field for below event.
       * @type {function(Object, yfiles.system.EventArgs)}
       * @private
       */
      '$closedEvent': null,
      
      'addClosedListener': function(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$closedEvent = yfiles.lang.delegate.combine(this.$closedEvent, value);
      },
      
      'removeClosedListener': function(/**function(Object, yfiles.system.EventArgs)*/ value) {
        this.$closedEvent = yfiles.lang.delegate.remove(this.$closedEvent, value);
      },
      
      /**
       * @type {function(Event)}
       * @private
       */
      'closeOnClick': null,
      
      /** @private */
      'invokeClosed': function() {
        document.documentElement.removeEventListener("click", this.closeOnClick, true);
        var /**system.EventHandler.<yfiles.system.EventArgs>*/ handler = this.$closedEvent;
        if (handler !== null) {
          handler(this, yfiles.system.EventArgs.EMPTY);
        }
      },
      
      /** @private */
      'invokeOpened': function() {
        document.documentElement.addEventListener("click", this.closeOnClick, true);
        var /**system.EventHandler.<yfiles.system.EventArgs>*/ handler = this.$openedEvent;
        if (handler !== null) {
          handler(this, yfiles.system.EventArgs.EMPTY);
        }
      },
      
      /** @return {boolean} */
      'isEmpty': function() {
        return this.peer.children.getElementCount() === 0;
      },
      
      'clearItems': function() {
        var /**demo.IComponent[]*/ arr;
        var /**number*/ i;
        for (i = 0, arr = this.peer.children.getEnumerableAsArray(); i < arr.length; i++) {
          var /**demo.IComponent*/ child = arr[i];
          this.peer.remove(child);
        }
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @class demo.ComponentExtensions
   */
  exports.ComponentExtensions = new yfiles.ClassDefinition(function() {
    /** @lends {demo.ComponentExtensions.prototype} */
    return {
      
      /** @lends {demo.ComponentExtensions} */
      '$static': {
        'showAt': function(/**demo.IContextMenu*/ menu, /**yfiles.geometry.PointD*/ location) {
          menu.location = location;
          menu.visible = true;
        }
        
      }
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @class demo.DefaultApplicationParserBackend
   * @implements {demo.IApplicationParserBackend}
   */
  exports.DefaultApplicationParserBackend = new yfiles.ClassDefinition(function() {

    /** @return {Element} */
    function createImageLink(/**string*/ clazz, /**string*/ url) {
      var /**Element*/ yworksSlogan = document.createElement("a");
      demo.ElementExtensions.addClass(yworksSlogan, clazz);
      yworksSlogan.setAttribute("href", url);
      return yworksSlogan;
    };

    function initButton(/**HTMLElement*/ element, /**demo.IButton*/ button) {
      var /**string*/ inner = null;
      if (element.hasChildNodes()) {
        inner = element.innerHTML;
        element.innerHTML = "";
      }
      var /**HTMLElement*/ span = (/**@type {HTMLElement}*/(document.createElement("span")));
      element.appendChild(span);
      if (inner !== null) {
        span.innerHTML = inner;
        demo.ElementExtensions.addClass(span, "demo-textcontent");
      }
      var /**string*/ icon = element.getAttribute("data-icon");
      if (!"undefined".equals(typeof(icon)) && icon !== null) {
        demo.ElementExtensions.addClass(span, "demo-icon-small");
        button.icon = icon;
      }
    };

    /** @lends {demo.DefaultApplicationParserBackend.prototype} */
    return {
      
      '$with': [demo.IApplicationParserBackend],
      
      // #region IApplicationParserBackend members

      /** @type {demo.IToolkit} */
      'toolkit': {
        'get': function() {
          return demo.DefaultApplicationParserBackend.YToolkit.INSTANCE;
        }
      },
      
      'addOnLoadCallback': function(/**function()*/ callback) {
        document.addEventListener("DOMContentLoaded", function(/**Event*/ evt) {
          callback();
        }, false);
      },
      
      'bindCommand': function(/**demo.ICommandComponent*/ commandComponent, /**demo.Application*/ application) {
        var /**Element*/ element = commandComponent.element;
        if (element.hasAttribute("data-command")) {
          var /**string*/ commandName = element.getAttribute("data-command");
          var command = application.getProperty(commandName);
          if (command !== null) {
            if (yfiles.system.ICommand.isInstance(command)) {
              commandComponent.command = (/**@type {yfiles.system.ICommand}*/(command));
            } else {
              commandComponent.addEventListener((/**@type {EventListener}*/(command)));
            }
          } else {
            var /**yfiles.system.CommandTypeConverter*/ converter = new yfiles.system.CommandTypeConverter();
            command = converter.convertFrom(commandName);
            if (command !== null) {
              commandComponent.command = (/**@type {yfiles.system.ICommand}*/(command));
            } else {
              console.log("Unknown command: " + commandName);
            }
          }
        }

        if (element.hasAttribute("data-state")) {
          commandComponent.enabled = !(yfiles.system.StringExtensions.stringEquals("disabled", element.getAttribute("data-state")));
        }
      },
      
      /** @return {demo.IComponent} */
      'createHeader': function() {
        var /**Element*/ header = document.createElement("header");
        header.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION, yfiles.lang.Enum.getName(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.$class, demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP));
        header.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_SPLITTER, "false");
        header.setAttribute("data-type", "Panel");
        demo.ElementExtensions.addClass(header, "demo-header");

        var /**Element*/ leftDiv = document.createElement("div");
        demo.ElementExtensions.addClass(leftDiv, "demo-left");
        header.appendChild(leftDiv);

        leftDiv.appendChild(createImageLink("demo-yFiles", "http://www.yworks.com/en/products_yfileshtml_about.html"));

        var /**Element*/ rightDiv = document.createElement("div");
        demo.ElementExtensions.addClass(rightDiv, "demo-right");
        header.appendChild(rightDiv);

        rightDiv.appendChild(createImageLink("demo-yLogo", "http://www.yworks.com"));
        rightDiv.appendChild(createImageLink("demo-ySlogan", "http://www.yworks.com"));
        return new demo.DefaultApplicationParserBackend.YComponent(header);
      },
      
      /** @return {demo.IComponent} */
      'createFooter': function() {
        var /**Element*/ footer = document.createElement("footer");
        ((/**@type {HTMLElement}*/(footer))).innerHTML = "Copyright &copy; 2011-2014 yWorks GmbH &middot; All rights reserved";
        footer.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION, yfiles.lang.Enum.getName(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.$class, demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.BOTTOM));
        footer.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_SPLITTER, "false");
        footer.setAttribute("data-type", "Panel");
        return new demo.DefaultApplicationParserBackend.YComponent(footer);
      },
      
      /** @return {demo.ConversionResult} */
      'convertAppRoot': function(/**HTMLElement*/ appRoot, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(appRoot, "demo-app");

        var /**demo.DefaultApplicationParserBackend.YApplicationFrame*/ applicationFrame = new demo.DefaultApplicationParserBackend.YApplicationFrame(appRoot);

        this.maybeAddHeaderAndFooter(appRoot, applicationFrame);

        var /**demo.ConversionResult*/ result = new demo.ConversionResult(applicationFrame);
        return result;
      },
      
      /** @private */
      'maybeAddHeaderAndFooter': function(/**Element*/ appRoot, /**demo.DefaultApplicationParserBackend.YApplicationFrame*/ applicationFrame) {
        var /**boolean*/ shouldAddHeader = true;
        var /**boolean*/ shouldAddFooter = true;

        for (var /**number*/ i = 0; i < appRoot.childNodes.length; i++) {
          var /**Node*/ child = appRoot.childNodes.item(i);
          if (child.nodeType !== Node.ELEMENT_NODE) {
            continue;
          }
          var /**HTMLElement*/ element = (/**@type {HTMLElement}*/(child));
          switch (element.tagName) {
            case "header":
              shouldAddHeader = false;
              break;
            case "footer":
              shouldAddFooter = false;
              break;
          }
        }
        if (shouldAddHeader) {
          applicationFrame.header = this.createHeader();
        }
        if (shouldAddFooter) {
          applicationFrame.footer = this.createFooter();
        }
      },
      
      /** @return {demo.ConversionResult} */
      'convertPanel': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-panel");
        return new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YPanel(element));
      },
      
      /** @return {demo.ConversionResult} */
      'convertButton': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-button");
        var /**demo.DefaultApplicationParserBackend.YButton*/ button = new demo.DefaultApplicationParserBackend.YButton(element);
        initButton(element, button);
        var /**demo.ConversionResult*/ newConversionResult = new demo.ConversionResult(button);
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      },
      
      /** @return {demo.ConversionResult} */
      'convertCheckBox': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-checkbox");
        var /**demo.ConversionResult*/ newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YCheckBox(element));
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      },
      
      /** @return {demo.ConversionResult} */
      'convertToggleButton': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-toggle-button");
        var /**demo.DefaultApplicationParserBackend.YToggleButton*/ button = new demo.DefaultApplicationParserBackend.YToggleButton(element);
        initButton(element, button);
        if (yfiles.system.StringExtensions.stringEquals("true", element.getAttribute("data-selected"))) {
          button.isChecked = true;
        }
        var /**demo.ConversionResult*/ newConversionResult = new demo.ConversionResult(button);
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      },
      
      /** @return {demo.ConversionResult} */
      'convertComboBox': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-combobox");
        var /**demo.ConversionResult*/ newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YComboBox(element));
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      },
      
      /** @return {demo.ConversionResult} */
      'convertTextArea': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-textarea");
        var /**demo.ConversionResult*/ newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YTextArea(element));
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      },
      
      /** @return {demo.ConversionResult} */
      'convertBorderLayout': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-borderlayout");
        var /**demo.ConversionResult*/ newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YBorderLayout(element));
        newConversionResult.traverseChildren = true;
        return newConversionResult;
      },
      
      /** @return {demo.ConversionResult} */
      'convertControl': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        var /**string*/ controlType = element.getAttribute("data-control-type");
        var /**yfiles.canvas.Control*/ control = null;
        if (controlType !== null && controlType.length > 0) {
          var /**yfiles.lang.Class*/ type = yfiles.lang.Class.forName(controlType);
          if (type !== null) {
            var instance = type.newInstance();
            control = (instance instanceof yfiles.canvas.Control) ? (/**@type {yfiles.canvas.Control}*/(instance)) : null;
            if (control !== null) {
              control.initialize((/**@type {HTMLDivElement}*/(element)));
            }
          }
        }

        if (control === null) {
          throw new yfiles.lang.Exception("Could not create control instance (" + controlType + ")");
        }

        var /**demo.ConversionResult*/ newConversionResult = new demo.ConversionResult((/**@type {demo.IComponent}*/(control)));
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      },
      
      /** @return {demo.ConversionResult} */
      'convertCollapsiblePane': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-collapsible-pane");
        var /**Element*/ header = document.createElement("span");
        ((/**@type {HTMLElement}*/(header))).innerHTML = element.getAttribute("data-header");
        header.setAttribute("class", "demo-collapsible-pane-header");

        var /**Element*/ content = document.createElement("div");
        content.setAttribute("class", "demo-collapsible-pane-content");

        if (element.children !== undefined) {
          var /**number*/ n = element.children.length;
          for (var /**number*/ i = 0; i < n; i++) {
            var /**Element*/ child = (/**@type {Element}*/(element.children[0]));
            element.removeChild(child);
            content.appendChild(child);
          }
        }

        var /**demo.CollapseStyle*/ collapseStyle;
        var /**string*/ style = element.hasAttribute("data-collapse") ? element.getAttribute("data-collapse").toLowerCase() : "none";
        switch (style) {
          case "left":
            collapseStyle = demo.CollapseStyle.LEFT;
            break;
          case "right":
            collapseStyle = demo.CollapseStyle.RIGHT;
            break;
          case "top":
            collapseStyle = demo.CollapseStyle.TOP;
            break;
          default:
            collapseStyle = demo.CollapseStyle.NONE;
            break;
        }

        var /**demo.DefaultApplicationParserBackend.YCollapsiblePane*/ collapsiblePane = new demo.DefaultApplicationParserBackend.YCollapsiblePane(element);
        collapsiblePane.header = element.getAttribute("data-header");
        collapsiblePane.content = content;
        collapsiblePane.collapseStyle = collapseStyle;

        return new demo.ConversionResult(collapsiblePane);
      },
      
      /** @return {demo.ConversionResult} */
      'convertSeparator': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        if (!yfiles.system.StringExtensions.stringEquals(element.tagName.toLowerCase(), "span")) {
          element = (/**@type {HTMLElement}*/(document.createElement("span")));
        }
        demo.ElementExtensions.addClass(element, "demo-separator");
        var /**demo.ConversionResult*/ newConversionResult = new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YSeparator(element));
        newConversionResult.replacement = element;
        newConversionResult.traverseChildren = false;
        return newConversionResult;
      },
      
      /** @return {demo.ConversionResult} */
      'convertToolBar': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-toolbar");
        return new demo.ConversionResult(new demo.DefaultApplicationParserBackend.YToolBar(element));
      },
      
      /** @return {demo.ConversionResult} */
      'convertFramerateCounter': function(/**HTMLElement*/ element, /**demo.Application*/ application) {
        demo.ElementExtensions.addClass(element, "demo-fps-counter");
        var /**demo.DefaultApplicationParserBackend.YFramerateCounter*/ counter = new demo.DefaultApplicationParserBackend.YFramerateCounter(element);

        var /**string*/ smoothingAtt = element.getAttribute("smoothing");
        if (smoothingAtt !== null) {
          var /**number*/ smoothing = parseInt(smoothingAtt, 10);
          counter.smoothing = smoothing;
        }

        var /**string*/ updateInterval = element.getAttribute("updateInterval");
        if (updateInterval !== null) {
          var /**number*/ update = parseInt(updateInterval, 10);
          counter.updateInterval = update;
        }

        counter.start();
        return new demo.ConversionResult(counter);
      },
      
      // #endregion IApplicationParserBackend members

      // #region component implementations

      // #endregion component implementations

      /** @lends {demo.DefaultApplicationParserBackend} */
      '$static': {
        /**
         * @class demo.DefaultApplicationParserBackend.SizeChangedEventArgs
         * @augments yfiles.system.EventArgs
         */
        'SizeChangedEventArgs': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.SizeChangedEventArgs.prototype} */
          return {
            '$extends': yfiles.system.EventArgs,
            
            'constructor': function(/**yfiles.geometry.SizeD*/ oldSize, /**yfiles.geometry.SizeD*/ newSize) {
              yfiles.system.EventArgs.call(this);
              this.$initSizeChangedEventArgs();
              this.oldSizeField = oldSize.clone();
              this.newSizeField = newSize.clone();
            },
            
            /**
             * @type {yfiles.geometry.SizeD}
             * @private
             */
            'oldSizeField': null,
            
            /**
             * @type {yfiles.geometry.SizeD}
             * @private
             */
            'newSizeField': null,
            
            /** @type {yfiles.geometry.SizeD} */
            'oldSize': {
              'get': function() {
                return this.oldSizeField.clone();
              }
            },
            
            /** @type {yfiles.geometry.SizeD} */
            'newSize': {
              'get': function() {
                return this.newSizeField.clone();
              }
            },
            
            /** @private */
            '$initSizeChangedEventArgs': function() {
              this.oldSizeField = yfiles.geometry.SizeD.createDefault();
              this.newSizeField = yfiles.geometry.SizeD.createDefault();
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YComponent
         * @augments demo.IComponent
         */
        'YComponent': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YComponent.prototype} */
          return {
            
            '$with': [demo.IComponent],
            
            'constructor': function(/**Element*/ element) {
              this.elementField = element;
            },
            
            /**
             * Backing field for below event.
             * @type {function(Object, demo.DefaultApplicationParserBackend.SizeChangedEventArgs)}
             * @private
             */
            '$sizeChangedEvent': null,
            
            'addSizeChangedListener': function(/**function(Object, demo.DefaultApplicationParserBackend.SizeChangedEventArgs)*/ value) {
              this.$sizeChangedEvent = yfiles.lang.delegate.combine(this.$sizeChangedEvent, value);
            },
            
            'removeSizeChangedListener': function(/**function(Object, demo.DefaultApplicationParserBackend.SizeChangedEventArgs)*/ value) {
              this.$sizeChangedEvent = yfiles.lang.delegate.remove(this.$sizeChangedEvent, value);
            },
            
            /** @type {Element} */
            'elementField': null,
            
            /** @type {Element} */
            'element': {
              'get': function() {
                return this.elementField;
              }
            },
            
            'onSizeChanged': function(/**demo.DefaultApplicationParserBackend.SizeChangedEventArgs*/ e) {
              if (this.$sizeChangedEvent !== null) {
                this.$sizeChangedEvent(this, e);
              }
            },
            
            'setSize': function(/**yfiles.geometry.SizeD*/ newSize) {
              this.setSizeWithUnit(newSize, null);
            },
            
            'setSizeWithUnit': function(/**yfiles.geometry.SizeD*/ newSize, /**string*/ unit) {
              var /**demo.ElementDimensions*/ dim = this.getDimensions();

              var /**yfiles.geometry.SizeD*/ oldSize = dim.contentRect.size;

              var /**yfiles.geometry.InsetsD*/ padding = dim.padding;
              var /**yfiles.geometry.InsetsD*/ margin = dim.margin;
              var /**yfiles.geometry.InsetsD*/ border = dim.border;
              newSize.width = Math.max(0, newSize.width - padding.left - padding.right - margin.left - margin.right - border.left - border.right);
              newSize.height = Math.max(0, newSize.height - padding.top - padding.bottom - margin.top - margin.bottom - border.top - border.bottom);

              unit = (unit !== undefined && unit !== null) ? unit : "px";
              if (newSize.width > 0 && oldSize.width !== newSize.width) {
                this.setStyleProperty("width", newSize.width + unit);
              }
              if (newSize.height > 0 && oldSize.height !== newSize.height) {
                this.setStyleProperty("height", newSize.height + unit);
              }
              this.onSizeChanged(new demo.DefaultApplicationParserBackend.SizeChangedEventArgs(oldSize, newSize));
            },
            
            'setLocation': function(/**yfiles.geometry.PointD*/ location) {
              this.setStyleProperty("left", location.x + "px");
              this.setStyleProperty("top", location.y + "px");
            },
            
            'setBounds': function(/**yfiles.geometry.RectD*/ bounds) {
              this.setLocation(bounds.topLeft);
              this.setSize(bounds.size);
            },
            
            /** @return {demo.ElementDimensions} */
            'getDimensions': function() {
              return new demo.ElementDimensions((/**@type {HTMLElement}*/(this.element)));
            },
            
            'setStyleProperty': function(/**string*/ propertyName, /**string*/ value) {
              var /**CSSStyleDeclaration*/ style = ((/**@type {HTMLElement}*/(this.elementField))).style;
              style.setProperty(propertyName, value, null);
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YContainer
         * @augments demo.DefaultApplicationParserBackend.YComponent
         * @augments demo.IContainer
         */
        'YContainer': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YContainer.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YComponent,
            
            '$with': [demo.IContainer],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YComponent.call(this, element);
              this.childrenField = new yfiles.collections.List/**.<demo.IComponent>*/();
            },
            
            /**
             * @type {yfiles.collections.List.<demo.IComponent>}
             * @private
             */
            'childrenField': null,
            
            /** @type {yfiles.collections.IEnumerable.<demo.IComponent>} */
            'children': {
              'get': function() {
                return this.childrenField;
              }
            },
            
            'add': function(/**demo.IComponent*/ child) {
              this.childrenField.add(child);
            },
            
            'remove': function(/**demo.IComponent*/ child) {
              this.childrenField.remove(child);
              this.removeWithElement(child instanceof yfiles.canvas.Control ? ((/**@type {yfiles.canvas.Control}*/(child))).div : child.element);
            },
            
            'layoutChildren': function() {
              this.children.forEach(function(/**demo.IComponent*/ child) {
                if (demo.IContainer.isInstance(child)) {
                  ((/**@type {demo.IContainer}*/(child))).layoutChildren();
                }
              });
            },
            
            'addWithElement': function(/**Element*/ e) {
              if (e.parentNode !== this.element) {
                this.element.appendChild(e);
              }
            },
            
            'removeWithElement': function(/**Element*/ e) {
              if (e.parentNode === this.element) {
                this.element.removeChild(e);
              }
            },
            
            'onSizeChanged': function(/**demo.DefaultApplicationParserBackend.SizeChangedEventArgs*/ e) {
              this.layoutChildren();
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YPanel
         * @augments demo.DefaultApplicationParserBackend.YContainer
         * @augments demo.IPanel
         * @private
         */
        'YPanel': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YPanel.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YContainer,
            
            '$with': [demo.IPanel],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YContainer.call(this, element);
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YApplicationFrame
         * @augments demo.DefaultApplicationParserBackend.YContainer
         * @augments demo.IApplicationFrame
         * @private
         */
        'YApplicationFrame': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YApplicationFrame.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YContainer,
            
            '$with': [demo.IApplicationFrame],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YContainer.call(this, element);
              var /**HTMLElement*/ borderLayoutDiv = (/**@type {HTMLElement}*/(document.createElement("div")));
              borderLayoutDiv.setAttribute("id", "demo-app-borderlayout");
              borderLayoutDiv.setAttribute("data-type", "BorderLayout");
              this.borderLayout = new demo.DefaultApplicationParserBackend.YBorderLayout(borderLayoutDiv);
              this.borderLayout.setStyleProperty("width", "100%");
              this.borderLayout.setStyleProperty("height", "100%");

              var /**HTMLElement*/ centerDiv = (/**@type {HTMLElement}*/(document.createElement("div")));
              centerDiv.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION, yfiles.lang.Enum.getName(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.$class, demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER));
              centerDiv.setAttribute("id", "demo-app-borderlayout-center");
              centerDiv.setAttribute("data-type", "Panel");
              this.centerPanel = new demo.DefaultApplicationParserBackend.YPanel(centerDiv);
              this.borderLayout.add(this.centerPanel);
              this.borderLayout.element.appendChild(this.centerPanel.element);

              var /**HTMLElement[]*/ arr;
              var /**number*/ i;
              for (i = 0, arr = ((/**@type {HTMLElement}*/(element))).children; i < arr.length; i++) {
                var /**HTMLElement*/ child = arr[i];
                centerDiv.appendChild(child);
              }

              this.element.appendChild(this.borderLayout.element);
            },
            
            /**
             * @type {demo.IComponent}
             * @private
             */
            'headerField': null,
            
            /**
             * @type {demo.IComponent}
             * @private
             */
            'footerField': null,
            
            /**
             * @type {demo.DefaultApplicationParserBackend.YBorderLayout}
             * @private
             */
            'borderLayout': null,
            
            /**
             * @type {demo.DefaultApplicationParserBackend.YPanel}
             * @private
             */
            'centerPanel': null,
            
            /** @type {demo.IComponent} */
            'header': {
              'get': function() {
                return this.headerField;
              },
              'set': function(/**demo.IComponent*/ value) {
                var /**Element*/ headerParent = this.borderLayout.element;
                if (value.element.parentNode !== headerParent) {
                  if (this.headerField !== null) {
                    this.remove(this.headerField);
                    headerParent.replaceChild(value.element, this.headerField.element);
                  } else if (headerParent.childNodes.length > 0) {
                    headerParent.insertBefore(value.element, headerParent.firstChild);
                  } else {
                    headerParent.appendChild(value.element);
                  }
                }
                this.headerField = value;
                this.borderLayout.add(this.headerField);
              }
            },
            
            /** @type {demo.IComponent} */
            'footer': {
              'get': function() {
                return this.footerField;
              },
              'set': function(/**demo.IComponent*/ value) {
                var /**Element*/ footerParent = this.borderLayout.element;
                if (value.element.parentNode !== footerParent) {
                  if (this.footerField !== null) {
                    this.remove(this.footerField);
                    footerParent.replaceChild(value.element, this.footerField.element);
                  } else {
                    footerParent.appendChild(value.element);
                  }
                }
                this.footerField = value;
                this.borderLayout.add(this.footerField);
              }
            },
            
            'removeWithElement': function(/**Element*/ e) {
              if (e.parentNode === this.centerPanel.element) {
                this.centerPanel.element.removeChild(e);
              }
            },
            
            'init': function() {
              this.layoutChildren();
              window.addEventListener("resize", (function(/**Event*/ evt) {
                this.layoutChildren();
              }).bind(this), false);
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YToolBar
         * @augments demo.DefaultApplicationParserBackend.YContainer
         * @augments demo.IToolBar
         * @private
         */
        'YToolBar': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YToolBar.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YContainer,
            
            '$with': [demo.IToolBar],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YContainer.call(this, element);
            },
            
            /** @return {demo.ISeparator} */
            'addSeparator': function() {
              var /**demo.DefaultApplicationParserBackend.YSeparator*/ separator = demo.DefaultApplicationParserBackend.YToolkit.INSTANCE.createSeparator();
              this.add(separator);
              return separator;
            },
            
            /** @return {demo.IButton} */
            'addButton': function(/**string*/ label) {
              var /**demo.DefaultApplicationParserBackend.YButton*/ button = demo.DefaultApplicationParserBackend.YToolkit.INSTANCE.createButton(label);
              this.add(button);
              return button;
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YSeparator
         * @augments demo.DefaultApplicationParserBackend.YComponent
         * @augments demo.ISeparator
         * @private
         */
        'YSeparator': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YSeparator.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YComponent,
            
            '$with': [demo.ISeparator],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YComponent.call(this, element);
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YCommandComponent
         * @augments demo.DefaultApplicationParserBackend.YComponent
         * @augments demo.ICommandComponent
         * @abstract
         * @private
         */
        'YCommandComponent': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YCommandComponent.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YComponent,
            '$abstract': true,
            
            '$with': [demo.ICommandComponent],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YComponent.call(this, element);
            },
            
            /**
             * @type {yfiles.system.ICommand}
             * @private
             */
            'commandField': null,
            
            /** @type {yfiles.system.ICommand} */
            'command': {
              'get': function() {
                return this.commandField;
              },
              'set': function(/**yfiles.system.ICommand*/ value) {
                if (this.commandField !== value) {
                  if (this.commandField !== null) {
                    this.commandField.removeCanExecuteChangedListener(yfiles.lang.delegate(this.handleCommandCanExecuteChanged, this));
                  }
                  this.commandField = value;
                  if (this.commandField !== null) {
                    this.commandField.addCanExecuteChangedListener(yfiles.lang.delegate(this.handleCommandCanExecuteChanged, this));
                    this.handleCommandCanExecuteChanged(null, null);
                  } else {
                    this.enabled = false;
                  }
                }
              }
            },
            
            /**
             * @type {Object}
             * @private
             */
            'commandParameterField': null,
            
            /** @type {Object} */
            'commandParameter': {
              'get': function() {
                return this.commandParameterField;
              },
              'set': function(/**Object*/ value) {
                if (this.commandParameterField !== value) {
                  this.commandParameterField = value;
                  if (this.commandField !== null) {
                    this.handleCommandCanExecuteChanged(null, null);
                  }
                }
              }
            },
            
            /**
             * @type {yfiles.canvas.Control}
             * @private
             */
            'commandTargetField': null,
            
            /** @type {yfiles.canvas.Control} */
            'commandTarget': {
              'get': function() {
                return this.commandTargetField;
              },
              'set': function(/**yfiles.canvas.Control*/ value) {
                if (this.commandTargetField !== value) {
                  this.commandTargetField = value;
                  if (this.commandField !== null) {
                    this.handleCommandCanExecuteChanged(null, null);
                  }
                }
              }
            },
            
            /** @private */
            'handleCommandCanExecuteChanged': function(/**Object*/ sender, /**yfiles.system.EventArgs*/ e) {
              if (this.commandField !== null) {
                var /**boolean*/ canExecute = this.commandField instanceof yfiles.system.RoutedCommand ? ((/**@type {yfiles.system.RoutedCommand}*/(this.commandField))).canExecuteOnTarget(this.commandParameterField, this.commandTargetField) : this.commandField.canExecute(this.commandParameterField);
                this.enabled = canExecute;
              } else {
                this.enabled = false;
              }
            },
            
            /** @private */
            'maybeExecuteCommand': function(/**Event*/ e) {
              if (this.commandField !== null && this.enabledField) {
                var /**boolean*/ canExecute = this.commandField instanceof yfiles.system.RoutedCommand ? ((/**@type {yfiles.system.RoutedCommand}*/(this.commandField))).canExecuteOnTarget(this.commandParameterField, this.commandTargetField) : this.commandField.canExecute(this.commandParameterField);
                if (canExecute) {
                  if (this.commandField instanceof yfiles.system.RoutedCommand) {
                    ((/**@type {yfiles.system.RoutedCommand}*/(this.commandField))).executeOnTarget(this.commandParameterField, this.commandTargetField);
                  } else {
                    this.commandField.execute(this.commandParameterField);
                  }
                }
              }
            },
            
            /**
             * @type {boolean}
             * @private
             */
            'enabledField': false,
            
            /** @type {boolean} */
            'enabled': {
              'get': function() {
                return this.enabledField;
              },
              'set': function(/**boolean*/ value) {
                if (value !== this.enabledField) {
                  if (value) {
                    demo.ElementExtensions.removeClass(this.elementField, "demo-disabled");
                  } else {
                    demo.ElementExtensions.addClass(this.elementField, "demo-disabled");
                  }
                  this.enabledField = value;
                }
              }
            },
            
            'addEventListener': yfiles.lang.Abstract,
            
            'removeEventListener': yfiles.lang.Abstract
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YButton
         * @augments demo.DefaultApplicationParserBackend.YCommandComponent
         * @augments demo.IButton
         * @private
         */
        'YButton': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YButton.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YCommandComponent,
            
            '$with': [demo.IButton],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YCommandComponent.call(this, element);
              this.enabled = true;
              this.elementField.addEventListener("click", yfiles.lang.delegate(this.clicked, this), false);
            },
            
            'clicked': function(/**Event*/ evt) {
              this.maybeExecuteCommand(evt);
            },
            
            /** @type {string} */
            'label': {
              'get': function() {
                return ((/**@type {HTMLElement}*/(this.elementField.firstChild))).innerHTML;
              },
              'set': function(/**string*/ value) {
                ((/**@type {HTMLElement}*/(this.elementField.firstChild))).innerHTML = value;
              }
            },
            
            /**
             * @type {string}
             * @private
             */
            'iconClass': null,
            
            /** @type {string} */
            'icon': {
              'get': function() {
                return this.iconClass;
              },
              'set': function(/**string*/ value) {
                if (yfiles.system.StringExtensions.isNotEqual(this.iconClass, value)) {
                  var /**HTMLElement*/ span = ((/**@type {HTMLElement}*/(this.elementField.firstChild)));
                  if (this.iconClass !== null) {
                    demo.ElementExtensions.removeClass(span, this.iconClass);
                  }
                  if (value !== null) {
                    demo.ElementExtensions.addClass(span, value);
                  }
                  this.iconClass = value;
                }
              }
            },
            
            /** @type {boolean} */
            'enabled': {
              'get': function() {
                return demo.DefaultApplicationParserBackend.YButton.$super.getOwnProperty("enabled", this).get();
              },
              'set': function(/**boolean*/ value) {
                demo.DefaultApplicationParserBackend.YButton.$super.getOwnProperty("enabled", this).set(value);
                this.elementField["disabled"] = !value;
              }
            },
            
            'addEventListener': function(/**function(Event)*/ handler) {
              this.elementField.addEventListener("click", handler, false);
            },
            
            'removeEventListener': function(/**function(Event)*/ handler) {
              this.elementField.removeEventListener("click", handler, false);
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YToggleButton
         * @augments demo.DefaultApplicationParserBackend.YButton
         * @augments demo.IToggleButton
         * @private
         */
        'YToggleButton': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YToggleButton.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YButton,
            
            '$with': [demo.IToggleButton],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YButton.call(this, element);
            },
            
            'clicked': function(/**Event*/ evt) {
              this.toggleState();
            },
            
            /** @private */
            'toggleState': function() {
              this.isChecked = !this.isChecked;
            },
            
            /**
             * @type {boolean}
             * @private
             */
            'isCheckedField': false,
            
            /** @type {boolean} */
            'isChecked': {
              'get': function() {
                return this.isCheckedField;
              },
              'set': function(/**boolean*/ value) {
                if (this.isCheckedField !== value) {
                  this.isCheckedField = value;
                  if (this.isCheckedField) {
                    demo.ElementExtensions.addClass(this.elementField, "demo-is-checked");
                  } else {
                    demo.ElementExtensions.removeClass(this.elementField, "demo-is-checked");
                  }
                  this.maybeExecuteCommand(null);
                }
              }
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YContextMenu
         * @augments demo.DefaultApplicationParserBackend.YContainer
         * @augments demo.IContextMenu
         * @private
         */
        'YContextMenu': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YContextMenu.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YContainer,
            
            '$with': [demo.IContextMenu],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YContainer.call(this, element);
              this.$initYContextMenu();
              this.location = new yfiles.geometry.PointD(0, 0);
              this.visible = false;
            },
            
            /**
             * @type {yfiles.geometry.PointD}
             * @private
             */
            'locationField': null,
            
            /** @type {yfiles.geometry.PointD} */
            'location': {
              'get': function() {
                return this.locationField.clone();
              },
              'set': function(/**yfiles.geometry.PointD*/ value) {
                this.locationField = value.clone();
                var /**CSSStyleDeclaration*/ style = ((/**@type {HTMLElement}*/(this.element))).style;
                style.setProperty("left", value.x + "px", "");
                style.setProperty("top", value.y + "px", "");
              }
            },
            
            /**
             * @type {boolean}
             * @private
             */
            'visibleField': false,
            
            /** @type {boolean} */
            'visible': {
              'get': function() {
                return this.visibleField;
              },
              'set': function(/**boolean*/ value) {
                if (this.visibleField !== value) {
                  this.visibleField = value;
                  var /**CSSStyleDeclaration*/ style = ((/**@type {HTMLElement}*/(this.element))).style;
                  if (this.visibleField) {
                    style.setProperty("display", "block", "");
                  } else {
                    style.setProperty("display", "none", "");
                  }
                }
              }
            },
            
            /** @return {demo.ISeparator} */
            'addSeparator': function() {
              var /**demo.DefaultApplicationParserBackend.YSeparator*/ separator = demo.DefaultApplicationParserBackend.YToolkit.INSTANCE.createSeparator();
              this.add(separator);
              this.addWithElement(separator.element);
              return separator;
            },
            
            /** @return {demo.IButton} */
            'createMenuItem': function(/**string*/ label) {
              var /**demo.IButton*/ menuItem = demo.DefaultApplicationParserBackend.YToolkit.INSTANCE.createMenuItem(label);
              this.add(menuItem);
              this.addWithElement(menuItem.element);
              return menuItem;
            },
            
            /** @private */
            '$initYContextMenu': function() {
              this.locationField = yfiles.geometry.PointD.createDefault();
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YTextArea
         * @augments demo.DefaultApplicationParserBackend.YComponent
         * @augments demo.ITextArea
         * @private
         */
        'YTextArea': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YTextArea.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YComponent,
            
            '$with': [demo.ITextArea],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YComponent.call(this, element);
              this.textAreaElement = (/**@type {HTMLTextAreaElement}*/(element));
            },
            
            /**
             * @type {HTMLTextAreaElement}
             * @private
             */
            'textAreaElement': null,
            
            /** @type {string} */
            'text': {
              'get': function() {
                return this.textAreaElement.value;
              },
              'set': function(/**string*/ value) {
                this.textAreaElement.value = value;
              }
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YBorderLayout
         * @augments demo.DefaultApplicationParserBackend.YContainer
         */
        'YBorderLayout': new yfiles.ClassDefinition(function() {

          var /**number*/ count = 0;

          /** @return {demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion} */
          function getLayoutRegion(/**demo.IComponent*/ component) {
            var /**string*/ layoutAttribute = component.element.getAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION);
            if (layoutAttribute !== null) {
              try {
                var o = yfiles.lang.Enum.parse(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.$class, layoutAttribute, true);
                return (/**@type {demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion}*/(o));
              } catch ( /**yfiles.lang.Exception*/ e ) {
                {
                  throw new yfiles.system.ArgumentException.FromMessage("Unknown layout region: " + layoutAttribute);
                }
              }
            }
            throw new yfiles.system.ArgumentException.FromMessage("No layout region set for border layout child " + component.element.getAttribute("id"));
          };

          /** @return {demo.DefaultApplicationParserBackend.YBorderLayout.LayoutArrangement} */
          function getLayoutArrangement(/**demo.IContainer*/ borderLayout) {
            var /**string*/ arrangementAttribute = borderLayout.element.getAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_ARRANGEMENT);
            if (arrangementAttribute !== null) {
              try {
                var o = yfiles.lang.Enum.parse(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutArrangement.$class, arrangementAttribute, true);
                return (/**@type {demo.DefaultApplicationParserBackend.YBorderLayout.LayoutArrangement}*/(o));
              } catch ( /**yfiles.lang.Exception*/ e ) {
                {
                  throw new yfiles.system.ArgumentException.FromMessage("Unknown layout arrangement: " + arrangementAttribute);
                }
              }
            }
            return demo.DefaultApplicationParserBackend.YBorderLayout.LayoutArrangement.HEADLINE;
          };

          /** @lends {demo.DefaultApplicationParserBackend.YBorderLayout.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YContainer,
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YContainer.call(this, element);
              var /**string*/ idAtt = element.getAttribute("id");
              if (idAtt === null || idAtt.length === 0) {
                element.setAttribute("id", "y-border-layout-" + count);
              }
              count++;
            },
            
            'layoutChildren': function() {
              this.setStyleProperty("position", "relative");

              var /**yfiles.geometry.RectD*/ box = this.getDimensions().contentRect;

              var /**yfiles.collections.List.<demo.IComponent>*/ sorted = this.children.getEnumerableAsList();
              sorted.sort(new demo.DefaultApplicationParserBackend.YBorderLayout.BorderLayoutComparer(this));

              var /**yfiles.collections.List.<demo.IComponent>*/ childrenAndSplitters = new yfiles.collections.List/**.<demo.IComponent>*/();

              sorted.forEach(function(/**demo.IComponent*/ child) {
                childrenAndSplitters.add(child);
                if (child instanceof demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent) {
                  var /**demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter*/ splitter = ((/**@type {demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent}*/(child))).splitter;
                  if (null !== splitter) {
                    childrenAndSplitters.add(splitter);
                  }
                }
              });

              var /**yfiles.util.IEnumerator*/ tmpEnumerator;
              for (tmpEnumerator = childrenAndSplitters.getListEnumerator(); tmpEnumerator.moveNext(); ) {
                var /**demo.IComponent*/ child = tmpEnumerator.current;
                {
                  var /**demo.ElementDimensions*/ childDimensions = child.getDimensions();
                  var /**yfiles.geometry.RectD*/ childBounds = childDimensions.bounds;
                  // we round the size to avoid floating point offsets due to subpixel layouts. 
                  childBounds.width = (((/**@type {number}*/(childBounds.width))) | 0);
                  childBounds.height = (((/**@type {number}*/(childBounds.height))) | 0);
                  var /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ region = getLayoutRegion(child);

                  if (child instanceof demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent) {
                    var /**demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent*/ resizableChild = ((/**@type {demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent}*/(child)));
                    if (resizableChild.changeSize) {
                      var /**yfiles.geometry.SizeD*/ newSize = resizableChild.newSize;
                      childBounds.width = newSize.width;
                      childBounds.height = newSize.height;
                      resizableChild.changeSize = false;
                    }
                  }

                  child.setLocation(box.topLeft);
                  child.setStyleProperty("position", "absolute");

                  switch (region) {
                    case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP:
                    case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.BOTTOM:
                      child.setSize(new yfiles.geometry.SizeD(box.width, childBounds.height));
                      box.height = box.height - (childBounds.height);
                      if (region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP) {
                        box.y = box.y + (childBounds.height);
                      } else {
                        child.setStyleProperty("top", box.y + box.height + "px");
                      }
                      break;
                    case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT:
                    case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.RIGHT:
                      child.setSize(new yfiles.geometry.SizeD(childBounds.width, box.height));
                      box.width = box.width - (childBounds.width);
                      if (region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT) {
                        box.x = box.x + (childBounds.width);
                      } else {
                        child.setStyleProperty("left", box.x + box.width + "px");
                      }
                      break;
                    case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER:
                      child.setBounds(box.clone());
                      break;
                  }
                }
              }


            },
            
            'add': function(/**demo.IComponent*/ child) {
              var /**Element*/ childElement = child.element;
              var /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ layoutRegion = getLayoutRegion(child);
              if (layoutRegion !== demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER) {
                var /**string*/ splitterAtt = childElement.getAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_SPLITTER);
                var /**boolean*/ resizable = splitterAtt !== null ? !yfiles.system.StringExtensions.stringEquals(yfiles.system.StringExtensions.toLowerInvariant(splitterAtt), "false") : true;
                if (resizable) {
                  var /**demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent*/ resizableChild = demo.IContainer.isInstance(child) ? new demo.DefaultApplicationParserBackend.YBorderLayout.YResizableContainer(this, (/**@type {demo.IContainer}*/(child)), layoutRegion) : new demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent(this, child, layoutRegion);
                  demo.DefaultApplicationParserBackend.YBorderLayout.$super.add.call(this, resizableChild);
                } else {
                  demo.DefaultApplicationParserBackend.YBorderLayout.$super.add.call(this, child);
                }
              } else {
                demo.DefaultApplicationParserBackend.YBorderLayout.$super.add.call(this, child);
              }

              var /**string*/ idAtt = child.element.getAttribute("id");
              if (idAtt === null || idAtt.length === 0) {
                var /**string*/ parentId = this.element.getAttribute("id");
                this.elementField.setAttribute("id", parentId + "-child-" + this.children.getElementCount());
              }
            },
            
            /** @lends {demo.DefaultApplicationParserBackend.YBorderLayout} */
            '$static': {
              'LayoutRegion': new yfiles.EnumDefinition(function() {
                return {
                  'TOP': 0,
                  'LEFT': 1,
                  'BOTTOM': 2,
                  'RIGHT': 3,
                  'CENTER': 4,
                  'UNKNOWN': 5
                };
              }),
              
              'LayoutArrangement': new yfiles.EnumDefinition(function() {
                return {
                  'HEADLINE': 0,
                  'SIDEBAR': 1
                };
              }),
              
              /** @type {string} */
              'DATA_ATTRIBUTE_LAYOUT_REGION': "data-layout-region",
              
              /** @type {string} */
              'DATA_ATTRIBUTE_SPLITTER': "data-splitter",
              
              /** @type {string} */
              'DATA_ATTRIBUTE_LAYOUT_ARRANGEMENT': "data-layout-arrangement",
              
              /**
               * @class demo.DefaultApplicationParserBackend.YBorderLayout.YResizableContainer
               * @augments demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent
               * @augments demo.IContainer
               * @private
               */
              'YResizableContainer': new yfiles.ClassDefinition(function() {
                /** @lends {demo.DefaultApplicationParserBackend.YBorderLayout.YResizableContainer.prototype} */
                return {
                  '$extends': demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent,
                  
                  '$with': [demo.IContainer],
                  
                  'constructor': function(/**demo.DefaultApplicationParserBackend.YBorderLayout*/ parent, /**demo.IContainer*/ component, /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ layoutRegion) {
                    demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent.call(this, parent, component, layoutRegion);
                  },
                  
                  /** @type {yfiles.collections.IEnumerable.<demo.IComponent>} */
                  'children': {
                    'get': function() {
                      return ((/**@type {demo.IContainer}*/(this.component))).children;
                    }
                  },
                  
                  'add': function(/**demo.IComponent*/ child) {
                    ((/**@type {demo.IContainer}*/(this.component))).add(child);
                  },
                  
                  'remove': function(/**demo.IComponent*/ child) {
                    ((/**@type {demo.IContainer}*/(this.component))).remove(child);
                  },
                  
                  'layoutChildren': function() {
                    ((/**@type {demo.IContainer}*/(this.component))).layoutChildren();
                  }
                  
                };
              }),
              
              /**
               * @class demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent
               * @augments demo.IComponent
               * @private
               */
              'YResizableComponent': new yfiles.ClassDefinition(function() {
                /** @lends {demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent.prototype} */
                return {
                  
                  '$with': [demo.IComponent],
                  
                  'constructor': function(/**demo.DefaultApplicationParserBackend.YBorderLayout*/ parent, /**demo.IComponent*/ component, /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ layoutRegion) {
                    this.componentField = component;

                    var /**HTMLElement*/ splitterContainer = (/**@type {HTMLElement}*/(document.createElement("div")));
                    demo.ElementExtensions.addClass(splitterContainer, "demo-splitter");
                    if (layoutRegion === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT || layoutRegion === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.RIGHT) {
                      demo.ElementExtensions.addClass(splitterContainer, "demo-splitter-vertical");
                    } else {
                      demo.ElementExtensions.addClass(splitterContainer, "demo-splitter-horizontal");
                    }
                    splitterContainer.setAttribute(demo.DefaultApplicationParserBackend.YBorderLayout.DATA_ATTRIBUTE_LAYOUT_REGION, yfiles.lang.Enum.getName(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.$class, layoutRegion));

                    var /**HTMLElement*/ splitterThumb = (/**@type {HTMLElement}*/(document.createElement("div")));
                    demo.ElementExtensions.addClass(splitterThumb, "demo-splitter-thumb");
                    splitterContainer.appendChild(splitterThumb);

                    var /**Node*/ sibling = this.element.nextSibling;
                    if (sibling === null) {
                      parent.element.appendChild(splitterContainer);
                    } else {
                      parent.element.insertBefore(splitterContainer, sibling);
                    }

                    this.splitterField = new demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter(splitterContainer, this, parent, layoutRegion);
                  },
                  
                  /**
                   * @type {demo.IComponent}
                   * @private
                   */
                  'componentField': null,
                  
                  /**
                   * @type {demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter}
                   * @private
                   */
                  'splitterField': null,
                  
                  /** @type {yfiles.geometry.SizeD} */
                  'newSize': null,
                  
                  /** @type {boolean} */
                  'changeSize': false,
                  
                  /** @type {demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter} */
                  'splitter': {
                    'get': function() {
                      return this.splitterField;
                    }
                  },
                  
                  /** @type {demo.IComponent} */
                  'component': {
                    'get': function() {
                      return this.componentField;
                    }
                  },
                  
                  /** @type {Element} */
                  'element': {
                    'get': function() {
                      return this.componentField.element;
                    }
                  },
                  
                  'setSize': function(/**yfiles.geometry.SizeD*/ newSize) {
                    this.componentField.setSize(newSize);
                  },
                  
                  'setSizeWithUnit': function(/**yfiles.geometry.SizeD*/ newSize, /**string*/ unit) {
                    this.componentField.setSizeWithUnit(newSize, unit);
                  },
                  
                  'setLocation': function(/**yfiles.geometry.PointD*/ location) {
                    this.componentField.setLocation(location);
                  },
                  
                  'setBounds': function(/**yfiles.geometry.RectD*/ bounds) {
                    this.componentField.setBounds(bounds);
                  },
                  
                  /** @return {demo.ElementDimensions} */
                  'getDimensions': function() {
                    return this.componentField.getDimensions();
                  },
                  
                  'setStyleProperty': function(/**string*/ propertyName, /**string*/ value) {
                    this.componentField.setStyleProperty(propertyName, value);
                  }
                  
                };
              }),
              
              /**
               * @class demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter
               * @augments demo.DefaultApplicationParserBackend.YComponent
               * @private
               */
              'YSplitter': new yfiles.ClassDefinition(function() {
                /** @lends {demo.DefaultApplicationParserBackend.YBorderLayout.YSplitter.prototype} */
                return {
                  '$extends': demo.DefaultApplicationParserBackend.YComponent,
                  
                  'constructor': function(/**Element*/ element, /**demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent*/ component, /**demo.DefaultApplicationParserBackend.YBorderLayout*/ container, /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ layoutRegion) {
                    demo.DefaultApplicationParserBackend.YComponent.call(this, element);
                    this.$initYSplitter();
                    this.container = container;
                    this.region = layoutRegion;
                    this.component = component;
                    this.horizontal = this.region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP || this.region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.BOTTOM;
                    this.topleft = this.region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP || this.region === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT;
                    element.addEventListener("mouseover", yfiles.lang.delegate(this.onMouseOver, this), false);
                    element.addEventListener("mouseout", yfiles.lang.delegate(this.onMouseOut, this), false);

                    element.addEventListener("mousedown", yfiles.lang.delegate(this.onMouseDown, this), false);
                    window.document.addEventListener("mouseup", yfiles.lang.delegate(this.onDocumentMouseUp, this), true);
                    window.document.addEventListener("mousemove", yfiles.lang.delegate(this.onDocumentMouseMove, this), true);
                  },
                  
                  /**
                   * @type {demo.DefaultApplicationParserBackend.YBorderLayout}
                   * @private
                   */
                  'container': null,
                  
                  /**
                   * @type {demo.DefaultApplicationParserBackend.YBorderLayout.YResizableComponent}
                   * @private
                   */
                  'component': null,
                  
                  /**
                   * @type {demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion}
                   * @private
                   */
                  'region': null,
                  
                  /**
                   * @type {boolean}
                   * @private
                   */
                  'horizontal': false,
                  
                  /**
                   * @type {boolean}
                   * @private
                   */
                  'topleft': false,
                  
                  /**
                   * @type {boolean}
                   * @private
                   */
                  'dragging': false,
                  
                  /**
                   * @type {number}
                   * @private
                   */
                  'dragStartMousePosition': 0,
                  
                  /**
                   * @type {number}
                   * @private
                   */
                  'dragStartSize': 0,
                  
                  /**
                   * @type {number}
                   * @private
                   */
                  'fixedChildSize': 0,
                  
                  /**
                   * @type {number}
                   * @private
                   */
                  'dragStartSplitterPosition': 0,
                  
                  /**
                   * @type {number}
                   * @private
                   */
                  'dragStartMaxSize': 0,
                  
                  /**
                   * @type {number}
                   * @private
                   */
                  'dragStartMinSize': 20,
                  
                  // add data-minSize attribute or use css min-width/height?
                  /** @private */
                  'onDragStart': function(/**Event*/ evt) {
                    this.dragging = true;
                    var /**MouseEvent*/ mouseEvent = ((/**@type {MouseEvent}*/(evt)));
                    var /**number*/ position = this.horizontal ? mouseEvent.pageY : mouseEvent.pageX;
                    this.dragStartMousePosition = position;
                    var /**yfiles.geometry.RectD*/ bounds = this.component.getDimensions().bounds;
                    this.dragStartSize = this.horizontal ? bounds.height : bounds.width;
                    this.fixedChildSize = this.horizontal ? bounds.width : bounds.height;
                    var /**string*/ positionAtt = this.horizontal ? "top" : "left";
                    this.dragStartSplitterPosition = parseFloat(((/**@type {HTMLElement}*/(this.element))).style.getPropertyValue(positionAtt));

                    var /**number*/ available = 0;
                    var /**demo.IComponent*/ centerComponent = null;
                    var /**yfiles.util.IEnumerator*/ tmpEnumerator;
                    for (tmpEnumerator = this.container.children.getEnumerator(); tmpEnumerator.moveNext(); ) {
                      var /**demo.IComponent*/ child = tmpEnumerator.current;
                      {
                        var /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ layoutRegion = getLayoutRegion(child);
                        if (layoutRegion === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER) {
                          centerComponent = child;
                          break;
                        }
                      }
                    }
                    if (centerComponent !== null) {
                      var /**yfiles.geometry.RectD*/ centerBounds = centerComponent.getDimensions().bounds;
                      available = this.horizontal ? centerBounds.height : centerBounds.width;
                    }
                    this.dragStartMaxSize = this.dragStartSize + available;
                  },
                  
                  /** @private */
                  'onDrag': function(/**Event*/ evt) {
                    var /**MouseEvent*/ mouseEvent = ((/**@type {MouseEvent}*/(evt)));
                    var /**number*/ position = this.horizontal ? mouseEvent.pageY : mouseEvent.pageX;
                    var /**number*/ delta = position - this.dragStartMousePosition;
                    var /**number*/ newSize = this.topleft ? this.dragStartSize + delta : this.dragStartSize - delta;
                    newSize = Math.max(Math.min(newSize, this.dragStartMaxSize), this.dragStartMinSize);

                    var /**string*/ splitterPos = delta + this.dragStartSplitterPosition + "px";
                    var /**string*/ positionAtt = this.horizontal ? "top" : "left";

                    var /**yfiles.geometry.SizeD*/ futureSize = (this.horizontal ? new yfiles.geometry.SizeD(this.fixedChildSize, newSize) : new yfiles.geometry.SizeD(newSize, this.fixedChildSize)).clone();
                    this.component.newSize = futureSize;
                    this.component.changeSize = true;
                    this.setStyleProperty(positionAtt, splitterPos);
                    this.container.layoutChildren();

                  },
                  
                  /** @private */
                  'onDragEnd': function(/**Event*/ evt) {
                    this.dragging = false;
                  },
                  
                  /** @private */
                  'onDocumentMouseMove': function(/**Event*/ evt) {
                    if (this.dragging) {
                      this.onDrag(evt);
                      evt.preventDefault();
                    }
                  },
                  
                  /** @private */
                  'onDocumentMouseUp': function(/**Event*/ evt) {
                    this.onDragEnd(evt);
                  },
                  
                  /** @private */
                  'onMouseDown': function(/**Event*/ evt) {
                    this.onDragStart(evt);
                    evt.preventDefault();
                  },
                  
                  /** @private */
                  'onMouseOver': function(/**Event*/ evt) {},
                  
                  /** @private */
                  'onMouseOut': function(/**Event*/ evt) {},
                  
                  /** @private */
                  '$initYSplitter': function() {
                    this.region = demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP;
                  }
                  
                };
              }),
              
              /**
               * @class demo.DefaultApplicationParserBackend.YBorderLayout.BorderLayoutComparer
               * @augments yfiles.collections.IComparer.<demo.IComponent>
               * @private
               */
              'BorderLayoutComparer': new yfiles.ClassDefinition(function() {

                var /**yfiles.collections.IDictionary.<demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion, number>*/ WEIGHT = null;

                /** @lends {demo.DefaultApplicationParserBackend.YBorderLayout.BorderLayoutComparer.prototype} */
                return {
                  
                  '$with': [yfiles.collections.IComparer],
                  
                  'constructor': function(/**demo.IContainer*/ borderLayout) {
                    this.borderLayout = borderLayout;
                  },
                  
                  /**
                   * @type {demo.IContainer}
                   * @private
                   */
                  'borderLayout': null,
                  
                  /**
                   * @return {number}
                   * @private
                   */
                  'getWeight': function(/**demo.IComponent*/ x) {
                    var /**demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion*/ layoutRegion = getLayoutRegion(x);
                    switch (layoutRegion) {
                      case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT:
                      case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.RIGHT:
                        return (getLayoutArrangement(this.borderLayout) === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutArrangement.SIDEBAR) ? 0 : 1;
                      case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP:
                      case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.BOTTOM:
                        return (getLayoutArrangement(this.borderLayout) === demo.DefaultApplicationParserBackend.YBorderLayout.LayoutArrangement.SIDEBAR) ? 1 : 0;
                      case demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER:
                        return yfiles.system.Math.INT32_MAX_VALUE;
                    }
                    return 0;
                  },
                  
                  /** @return {number} */
                  'compare': function(/**demo.IComponent*/ x, /**demo.IComponent*/ y) {
                    var /**number*/ weightX = this.getWeight(x);
                    var /**number*/ weightY = this.getWeight(y);
                    return weightX - weightY;
                  },
                  
                  /** @lends {demo.DefaultApplicationParserBackend.YBorderLayout.BorderLayoutComparer} */
                  '$static': {
                    '$clinit': function() {
                      WEIGHT = new yfiles.collections.Dictionary/**.<demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion, number>*/();
                      WEIGHT.put(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.LEFT, 0);
                      WEIGHT.put(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.RIGHT, 0);
                      WEIGHT.put(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.TOP, 1);
                      WEIGHT.put(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.BOTTOM, 1);
                      WEIGHT.put(demo.DefaultApplicationParserBackend.YBorderLayout.LayoutRegion.CENTER, yfiles.system.Math.INT32_MAX_VALUE);
                    }
                    
                  }
                };
              })
              
            }
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YComboBox
         * @augments demo.DefaultApplicationParserBackend.YCommandComponent
         * @augments demo.IComboBox
         * @private
         */
        'YComboBox': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YComboBox.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YCommandComponent,
            
            '$with': [demo.IComboBox],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YCommandComponent.call(this, element);
              this.selectElement = (/**@type {HTMLSelectElement}*/(element));
              element.setAttribute("size", "1");
              this.addEventListener(yfiles.lang.delegate(this.maybeExecuteCommand, this));
            },
            
            /**
             * @type {HTMLSelectElement}
             * @private
             */
            'selectElement': null,
            
            /**
             * @type {yfiles.collections.IEnumerable.<string>}
             * @private
             */
            'itemsField': null,
            
            /** @type {yfiles.collections.IEnumerable.<string>} */
            'items': {
              'get': function() {
                return this.itemsField;
              },
              'set': function(/**yfiles.collections.IEnumerable.<string>*/ value) {
                if (!this.isEmpty()) {
                  demo.DefaultApplicationParserBackend.YToolkit.removeAllChildren((/**@type {HTMLElement}*/(this.element)));
                }

                this.itemsField = value;
                this.enabled = !this.isEmpty();

                if (value !== null) {
                  value.forEach((function(/**string*/ s) {
                    var /**Element*/ optionElement = document.createElement("option");
                    optionElement.textContent = s;
                    this.element.appendChild(optionElement);
                  }).bind(this));
                  this.setSelectedIndexCore(0);
                } else {
                  this.maybeExecuteCommand(null);
                }
              }
            },
            
            /**
             * @return {boolean}
             * @private
             */
            'isEmpty': function() {
              return this.itemsField === null || this.itemsField.getElementCount() === 0;
            },
            
            /** @private */
            'setSelectedIndexCore': function(/**number*/ value) {
              this.selectElement.selectedIndex = value;
              this.maybeExecuteCommand(null);
            },
            
            /** @type {number} */
            'length': {
              'get': function() {
                return this.selectElement.length;
              }
            },
            
            /** @return {string} */
            'elementAt': function(/**number*/ index) {
              var /**Node*/ elementAt = this.selectElement.options.item(index);
              return elementAt === null ? null : elementAt.textContent;
            },
            
            /** @type {number} */
            'selectedIndex': {
              'get': function() {
                return this.selectElement.selectedIndex;
              },
              'set': function(/**number*/ value) {
                if (value !== this.selectElement.selectedIndex) {
                  this.setSelectedIndexCore(value);
                }
              }
            },
            
            /** @type {string} */
            'selectedItem': {
              'get': function() {
                return this.elementAt(this.selectedIndex);
              },
              'set': function(/**string*/ value) {
                var /**number*/ n = this.length;
                for (var /**number*/ i = 0; i < n; i++) {
                  if (yfiles.system.StringExtensions.isEqual(value, this.elementAt(i))) {
                    this.selectedIndex = i;
                    break;
                  }
                }
              }
            },
            
            'addEventListener': function(/**function(Event)*/ handler) {
              this.element.addEventListener("change", handler, false);
            },
            
            'removeEventListener': function(/**function(Event)*/ handler) {
              this.element.removeEventListener("change", handler, false);
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YCheckBox
         * @augments demo.DefaultApplicationParserBackend.YCommandComponent
         * @augments demo.ICheckBox
         * @private
         */
        'YCheckBox': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YCheckBox.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YCommandComponent,
            
            '$with': [demo.ICheckBox],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YCommandComponent.call(this, element);
              this.checkBoxElement = (/**@type {HTMLInputElement}*/(element));
              this.addEventListener(yfiles.lang.delegate(this.maybeExecuteCommand, this));
            },
            
            /**
             * @type {HTMLInputElement}
             * @private
             */
            'checkBoxElement': null,
            
            /** @type {boolean} */
            'isChecked': {
              'get': function() {
                return this.checkBoxElement.checked;
              },
              'set': function(/**boolean*/ value) {
                if (value !== this.checkBoxElement.checked) {
                  this.checkBoxElement.checked = value;
                  this.maybeExecuteCommand(null);
                }
              }
            },
            
            'addEventListener': function(/**function(Event)*/ handler) {
              this.element.addEventListener("change", handler, false);
            },
            
            'removeEventListener': function(/**function(Event)*/ handler) {
              this.element.removeEventListener("change", handler, false);
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YCollapsiblePane
         * @augments demo.DefaultApplicationParserBackend.YPanel
         * @augments demo.ICollapsiblePane
         * @private
         */
        'YCollapsiblePane': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YCollapsiblePane.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YPanel,
            
            '$with': [demo.ICollapsiblePane],
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YPanel.call(this, element);
              this.$initYCollapsiblePane();
            },
            
            /**
             * @type {Element}
             * @private
             */
            'headerField': null,
            
            /**
             * @type {Element}
             * @private
             */
            'contentField': null,
            
            'collapse': function() {
              if (this.collapseStyle === demo.CollapseStyle.NONE) {
                return;
              }
              if (this.isExpanded) {
                demo.ElementExtensions.addClass(this.elementField, "demo-collapsed");
              }
              this.isExpanded = false;
            },
            
            'expand': function() {
              if (this.collapseStyle === demo.CollapseStyle.NONE) {
                return;
              }
              if (!this.isExpanded) {
                demo.ElementExtensions.removeClass(this.elementField, "demo-collapsed");
              }
              this.isExpanded = true;
            },
            
            'toggle': function() {
              if (this.isExpanded) {
                this.collapse();
              } else {
                this.expand();
              }
            },
            
            /**
             * Backing field for below property 
             * @type {boolean}
             * @private
             */
            '$isExpanded': false,
            
            /** @type {boolean} */
            'isExpanded': {
              'get': function() {
                return this.$isExpanded;
              },
              'set': function(/**boolean*/ value) {
                this.$isExpanded = value;
              }
            },
            
            /** @type {string} */
            'header': {
              'get': function() {
                return ((/**@type {HTMLElement}*/(this.headerField))).innerHTML;
              },
              'set': function(/**string*/ value) {
                if (this.headerField === null) {
                  this.headerField = document.createElement("span");
                  this.headerField.setAttribute("class", "demo-collapsible-pane-header");
                  if (this.contentField !== null) {
                    this.elementField.insertBefore(this.headerField, this.contentField);
                  } else {
                    this.elementField.appendChild(this.headerField);
                  }
                  this.headerField.addEventListener("click", (function(/**Event*/ e) {
                    this.toggle();
                  }).bind(this), false);
                }
                ((/**@type {HTMLElement}*/(this.headerField))).innerHTML = value;
              }
            },
            
            /** @type {Element} */
            'content': {
              'get': function() {
                return this.contentField;
              },
              'set': function(/**Element*/ value) {
                if (this.contentField !== null) {
                  this.elementField.replaceChild(value, this.contentField);
                } else {
                  this.elementField.appendChild(value);
                }
                this.contentField = value;
              }
            },
            
            /**
             * Backing field for below property 
             * @type {demo.CollapseStyle}
             * @private
             */
            '$collapseStyle': null,
            
            /** @type {demo.CollapseStyle} */
            'collapseStyle': {
              'get': function() {
                return this.$collapseStyle;
              },
              'set': function(/**demo.CollapseStyle*/ value) {
                this.$collapseStyle = value;
              }
            },
            
            /** @private */
            '$initYCollapsiblePane': function() {
              this.$collapseStyle = demo.CollapseStyle.TOP;
            }
            
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YToolkit
         * @augments demo.IToolkit
         * @private
         */
        'YToolkit': new yfiles.ClassDefinition(function() {

          var /**demo.DefaultApplicationParserBackend.YToolkit*/ instanceField = null;

          /** @lends {demo.DefaultApplicationParserBackend.YToolkit.prototype} */
          return {
            
            '$with': [demo.IToolkit],
            
            'constructor': function() {},
            
            /** @return {demo.DefaultApplicationParserBackend.YSeparator} */
            'createSeparator': function() {
              var /**Element*/ element = document.createElement("span");
              demo.ElementExtensions.addClass(element, "demo-separator");
              return new demo.DefaultApplicationParserBackend.YSeparator(element);
            },
            
            /** @return {demo.DefaultApplicationParserBackend.YButton} */
            'createButton': function(/**string*/ label) {
              var /**Element*/ button = document.createElement("button");
              button.setAttribute("class", "demo-button");
              ((/**@type {HTMLElement}*/(button))).innerHTML = label;
              return new demo.DefaultApplicationParserBackend.YButton(button);
            },
            
            /** @return {demo.DefaultApplicationParserBackend.YToolBar} */
            'createToolBar': function() {
              var /**Element*/ e = document.createElement("div");
              e.setAttribute("class", "demo-toolbar");
              return new demo.DefaultApplicationParserBackend.YToolBar(e);
            },
            
            /** @return {demo.IContextMenu} */
            'createContextMenu': function() {
              var /**Element*/ contextMenu = document.createElement("ul");
              document.body.appendChild(contextMenu);
              contextMenu.setAttribute("class", "demo-context-menu");
              return new demo.DefaultApplicationParserBackend.YContextMenu(contextMenu);
            },
            
            /** @return {demo.IButton} */
            'createMenuItem': function(/**string*/ label) {
              var /**Element*/ button = document.createElement("li");
              button.setAttribute("class", "demo-menu-item");
              ((/**@type {HTMLElement}*/(button))).innerHTML = label;
              return new demo.DefaultApplicationParserBackend.YButton(button);
            },
            
            /** @lends {demo.DefaultApplicationParserBackend.YToolkit} */
            '$static': {
              /** @type {demo.DefaultApplicationParserBackend.YToolkit} */
              'INSTANCE': {
                'get': function() {
                  return (instanceField) !== null ? instanceField : (instanceField = new demo.DefaultApplicationParserBackend.YToolkit());
                }
              },
              
              'removeAllChildren': function(/**HTMLElement*/ element) {
                if (element.children !== undefined) {
                  var /**number*/ n = element.children.length;
                  for (var /**number*/ i = 0; i < n; i++) {
                    var /**Element*/ child = (/**@type {Element}*/(element.children[0]));
                    element.removeChild(child);
                  }
                }
              },
              
              /** @type {yfiles.geometry.SizeD} */
              'BROWSER_SIZE': {
                'get': function() {
                  if (!"undefined".equals(typeof(window["innerWidth"]))) {
                    return new yfiles.geometry.SizeD(window.innerWidth, window.innerHeight);
                  }
                  if (!"undefined".equals(typeof(document["documentElement"])) && (/**@type {number}*/(document.documentElement["clientWidth"])) !== 0) {
                    return new yfiles.geometry.SizeD((/**@type {number}*/(document.documentElement["clientWidth"])), (/**@type {number}*/(document.documentElement["clientHeight"])));
                  }
                  if (!"undefined".equals(typeof(document.body))) {
                    return new yfiles.geometry.SizeD(document.body.clientWidth, document.body.clientHeight);
                  }
                  return new yfiles.geometry.SizeD(0, 0);
                }
              },
              
              /** @type {boolean} */
              'IS_LANDSCAPE': {
                'get': function() {
                  var /**yfiles.geometry.SizeD*/ size = demo.DefaultApplicationParserBackend.YToolkit.BROWSER_SIZE;
                  return size.width > size.height;
                }
              },
              
              /** @type {boolean} */
              'IS_PORTRAIT': {
                'get': function() {
                  return !demo.DefaultApplicationParserBackend.YToolkit.IS_LANDSCAPE;
                }
              }
              
            }
          };
        }),
        
        /**
         * @class demo.DefaultApplicationParserBackend.YFramerateCounter
         * @augments demo.DefaultApplicationParserBackend.YComponent
         */
        'YFramerateCounter': new yfiles.ClassDefinition(function() {
          /** @lends {demo.DefaultApplicationParserBackend.YFramerateCounter.prototype} */
          return {
            '$extends': demo.DefaultApplicationParserBackend.YComponent,
            
            'constructor': function(/**Element*/ element) {
              demo.DefaultApplicationParserBackend.YComponent.call(this, element);
              this.$initYFramerateCounter();
              this.smoothing = 1;
              this.updateInterval = 1000;
            },
            
            /**
             * @type {number}
             * @private
             */
            'lastUpdate': null,
            
            /**
             * @type {number}
             * @private
             */
            'fps': 0,
            
            /** @type {number} */
            'smoothing': 0,
            
            /** @type {number} */
            'updateInterval': 0,
            
            'start': function() {
              setTimeout(yfiles.lang.delegate(this.tick, this), 1);
              setTimeout(yfiles.lang.delegate(this.drawFPSTimeout_Tick, this), this.updateInterval);
            },
            
            /** @private */
            'tick': function() {
              var /**number*/ now = Date.now();
              var /**number*/ d = now - this.lastUpdate;
              var /**number*/ current = d !== 0 ? 1000 / d : 0;
              this.fps += (current - this.fps) / this.smoothing;
              this.lastUpdate = now;

              setTimeout(yfiles.lang.delegate(this.tick, this), 1);
            },
            
            /** @private */
            'drawFPSTimeout_Tick': function() {
              this.drawFPS();
              setTimeout(yfiles.lang.delegate(this.drawFPSTimeout_Tick, this), this.updateInterval);
            },
            
            /** @private */
            'drawFPS': function() {
              ((/**@type {HTMLElement}*/(this.element))).innerHTML = ((/**@type {Number}*/((this.fps)))).toFixed(1) + " fps";
            },
            
            /** @private */
            '$initYFramerateCounter': function() {
              this.lastUpdate = Date.now();
            }
            
          };
        })
        
      }
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IContextMenu
   * @implements {demo.IContainer}
   */
  exports.IContextMenu = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IContextMenu.prototype} */
    return {
      '$with': [demo.IContainer],
      
      /** @type {yfiles.geometry.PointD} */
      'location': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {boolean} */
      'visible': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @return {demo.ISeparator} */
      'addSeparator': yfiles.lang.Abstract,
      
      /** @return {demo.IButton} */
      'createMenuItem': yfiles.lang.Abstract,
      
      'showAt': function(/**yfiles.geometry.PointD*/ location) {
        demo.ComponentExtensions.showAt(this, location);
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.ICheckBox
   * @implements {demo.IComponent}
   */
  exports.ICheckBox = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.ICheckBox.prototype} */
    return {
      '$with': [demo.IComponent],
      
      /** @type {boolean} */
      'isChecked': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IToolkit
   */
  exports.IToolkit = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IToolkit.prototype} */
    return {
      /** @return {demo.IContextMenu} */
      'createContextMenu': yfiles.lang.Abstract
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @class demo.CollapseStyle
   */
  exports.CollapseStyle = new yfiles.EnumDefinition(function() {
    /** @lends {demo.CollapseStyle.prototype} */
    return {
      'TOP': 0,
      'LEFT': 1,
      'RIGHT': 2,
      'NONE': 3
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * Converts (modifies or creates a replacement for) a DOM element so that it is suitable for usage as a component.
   * @interface demo.IApplicationParserBackend
   */
  exports.IApplicationParserBackend = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IApplicationParserBackend.prototype} */
    return {
      /** @type {demo.IToolkit} */
      'toolkit': {
        'get': yfiles.lang.Abstract
      },
      
      /**
       * The given action will be executed once the DOM has been build and all scripts and style sheets have been loaded.
       */
      'addOnLoadCallback': yfiles.lang.Abstract,
      
      /**
       * Converts the application root. Might be a div element or the document body.
       * @return {demo.ConversionResult}
       */
      'convertAppRoot': yfiles.lang.Abstract,
      
      /**
       * Binds registered commands to the elements with 'command-name' attribute. 
       * This is called after {@link demo.IApplicationParserBackend#convertAppRoot} to ensure that all members already exist.
       */
      'bindCommand': yfiles.lang.Abstract,
      
      /**
       * Creates the default yFiles for HTML demo header.
       * @return {demo.IComponent}
       */
      'createHeader': yfiles.lang.Abstract,
      
      /**
       * Creates the default yFiles for HTML demo footer.
       * @return {demo.IComponent}
       */
      'createFooter': yfiles.lang.Abstract,
      
      /** @return {demo.ConversionResult} */
      'convertPanel': yfiles.lang.Abstract,
      
      /**
       * Creates a button from the given element.
       * If there is a "data-command" attribute, then it should try to find a matching {@link yfiles.system.ICommand} from
       * either the given {@link demo.Application} or the {@link yfiles.system.CommandTypeConverter} and wrap it as the handler.
       * @return {demo.ConversionResult}
       */
      'convertButton': yfiles.lang.Abstract,
      
      /**
       * Creates a combo box from the given element.
       * @return {demo.ConversionResult}
       */
      'convertComboBox': yfiles.lang.Abstract,
      
      /**
       * Creates a collapsible pane for the given element.
       * The collapsible pane should contain a header and a content area.
       * The header content is contained in the "data-header" attribute, the content is the content of the element.
       * The collapse operation should be based on the value of the "data-collapse" property and should support the following values:
       * <ul>
       * <li>none - No action should be performed.</li>
       * <li>top - The content disappears, the header should not be changed.</li>
       * <li>left - The content disappears, the header is translated by -90 degrees.</li>
       * <li>right - The content disappears, the header is translated by 270 degrees.</li>
       * </ul>
       * If present, the {@link demo.ConversionResult#component} should be an instance of {@link demo.ICollapsiblePane}.
       * @return {demo.ConversionResult}
       */
      'convertCollapsiblePane': yfiles.lang.Abstract,
      
      /**
       * Creates a component that can be used as a separator. The input may be any type of element.
       * @return {demo.ConversionResult}
       */
      'convertSeparator': yfiles.lang.Abstract,
      
      /**
       * Converts an element into a toolbar which contains buttons.
       * @param {HTMLElement} element 
       * @param {demo.Application} application 
       * @return {demo.ConversionResult} 
       */
      'convertToolBar': yfiles.lang.Abstract,
      
      /** @return {demo.ConversionResult} */
      'convertToggleButton': yfiles.lang.Abstract,
      
      /** @return {demo.ConversionResult} */
      'convertTextArea': yfiles.lang.Abstract,
      
      /** @return {demo.ConversionResult} */
      'convertBorderLayout': yfiles.lang.Abstract,
      
      /** @return {demo.ConversionResult} */
      'convertControl': yfiles.lang.Abstract,
      
      /** @return {demo.ConversionResult} */
      'convertCheckBox': yfiles.lang.Abstract,
      
      /** @return {demo.ConversionResult} */
      'convertFramerateCounter': yfiles.lang.Abstract
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * Responsible for creating or retrieving the {@link demo.IApplicationParserBackend}.
   * To register a new backend, just add it to the {@link demo.BackendFactory#BackendRegistry} field and pass the used key to
   * the {@link demo.Application#start} in
   * the "options" parameter.
   * @class demo.BackendFactory
   */
  exports.BackendFactory = new yfiles.ClassDefinition(function() {
    /** @lends {demo.BackendFactory.prototype} */
    return {
      
      /** @lends {demo.BackendFactory} */
      '$static': {
        /** @type {Object} */
        'BackendRegistry': null,
        
        /** @type {demo.IApplicationParserBackend} */
        'currentBackend': null,
        
        /** @return {demo.IApplicationParserBackend} */
        'getBackend': function(/**string*/ name) {
          if (demo.BackendFactory.BackendRegistry[name] !== undefined) {
            return demo.BackendFactory.currentBackend = (/**@type {demo.IApplicationParserBackend}*/(demo.BackendFactory.BackendRegistry[name]));
          }
          return demo.BackendFactory.currentBackend = new demo.DefaultApplicationParserBackend();
        },
        
        '$clinit': function() {
          demo.BackendFactory.BackendRegistry = new Object();
        }
        
      }
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @class demo.ElementDimensions
   */
  exports.ElementDimensions = new yfiles.StructDefinition(function() {
    /** @lends {demo.ElementDimensions.prototype} */
    return {
      'constructor': function(/**HTMLElement*/ element) {
        demo.ElementDimensions.createDefault.call(this);
        var /**CSSStyleDeclaration*/ style = getComputedStyle(element);

        var /**number*/ pl = parseFloat(style.getPropertyValue("padding-left"));
        var /**number*/ pt = parseFloat(style.getPropertyValue("padding-top"));
        var /**number*/ pr = parseFloat(style.getPropertyValue("padding-right"));
        var /**number*/ pb = parseFloat(style.getPropertyValue("padding-bottom"));
        var /**number*/ ml = parseFloat(style.getPropertyValue("margin-left"));
        var /**number*/ mt = parseFloat(style.getPropertyValue("margin-top"));
        var /**number*/ mr = parseFloat(style.getPropertyValue("margin-right"));
        var /**number*/ mb = parseFloat(style.getPropertyValue("margin-bottom"));
        var /**number*/ w = parseFloat(style.getPropertyValue("width"));
        var /**number*/ h = parseFloat(style.getPropertyValue("height"));
        var /**number*/ bl = parseFloat(style.getPropertyValue("border-left-width"));
        var /**number*/ bt = parseFloat(style.getPropertyValue("border-top-width"));
        var /**number*/ br = parseFloat(style.getPropertyValue("border-right-width"));
        var /**number*/ bb = parseFloat(style.getPropertyValue("border-bottom-width"));

        var /**ClientRect*/ rect = element.getBoundingClientRect();

        this.paddingField = new yfiles.geometry.InsetsD.FromLeftTopRightAndBottom(pl, pt, pr, pb);
        this.marginField = new yfiles.geometry.InsetsD.FromLeftTopRightAndBottom(ml, mt, mr, mb);
        this.borderField = new yfiles.geometry.InsetsD.FromLeftTopRightAndBottom(bl, bt, br, bb);
        this.sizeField = new yfiles.geometry.SizeD(w, h);
        this.locationField = new yfiles.geometry.PointD(rect.left, rect.top);
        this.boundsField = new yfiles.geometry.RectD(this.locationField.x - this.marginField.left, this.locationField.y - this.marginField.top, rect.width + this.marginField.left + this.marginField.right, rect.height + this.marginField.top + this.marginField.bottom);
        this.contentRectField = new yfiles.geometry.RectD(this.paddingField.left, this.paddingField.top, rect.width - this.borderField.horizontalInsets - this.paddingField.horizontalInsets, rect.height - this.borderField.verticalInsets - this.paddingField.verticalInsets);
      },
      
      /**
       * @type {yfiles.geometry.InsetsD}
       * @private
       */
      'paddingField': null,
      
      /**
       * @type {yfiles.geometry.InsetsD}
       * @private
       */
      'marginField': null,
      
      /**
       * @type {yfiles.geometry.InsetsD}
       * @private
       */
      'borderField': null,
      
      /**
       * @type {yfiles.geometry.SizeD}
       * @private
       */
      'sizeField': null,
      
      /**
       * @type {yfiles.geometry.PointD}
       * @private
       */
      'locationField': null,
      
      /**
       * @type {yfiles.geometry.RectD}
       * @private
       */
      'boundsField': null,
      
      /**
       * @type {yfiles.geometry.RectD}
       * @private
       */
      'contentRectField': null,
      
      /** @type {yfiles.geometry.RectD} */
      'contentRect': {
        'get': function() {
          return this.contentRectField.clone();
        }
      },
      
      /** @type {yfiles.geometry.InsetsD} */
      'border': {
        'get': function() {
          return this.borderField.clone();
        }
      },
      
      /** @type {yfiles.geometry.InsetsD} */
      'padding': {
        'get': function() {
          return this.paddingField.clone();
        }
      },
      
      /** @type {yfiles.geometry.InsetsD} */
      'margin': {
        'get': function() {
          return this.marginField.clone();
        }
      },
      
      /** @type {yfiles.geometry.SizeD} */
      'size': {
        'get': function() {
          return this.sizeField.clone();
        }
      },
      
      /** @type {yfiles.geometry.PointD} */
      'location': {
        'get': function() {
          return this.locationField.clone();
        }
      },
      
      /** @type {yfiles.geometry.RectD} */
      'bounds': {
        'get': function() {
          return this.boundsField.clone();
        }
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @class demo.DemoFrameworkConstants
   */
  exports.DemoFrameworkConstants = new yfiles.ClassDefinition(function() {
    /** @lends {demo.DemoFrameworkConstants.prototype} */
    return {
      
      /** @lends {demo.DemoFrameworkConstants} */
      '$static': {
        /** @type {string} */
        'DATA_ATTRIBUTE_LAYOUT_ORIENTATION': "data-layout-orientation"
        
      }
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * Walks through a given DOM Element and its children and modifies the DOM to represent a fully functional application.
   * @class demo.ApplicationParser
   */
  exports.ApplicationParser = new yfiles.ClassDefinition(function() {
    /** @lends {demo.ApplicationParser.prototype} */
    return {
      
      /** @type {demo.Application} */
      'application': null,
      
      /** @type {demo.IApplicationParserBackend} */
      'backend': null,
      
      /** @return {demo.IApplicationFrame} */
      'parseApplication': function(/**Element*/ appRoot) {
        var /**demo.ConversionResult*/ conversionResult = this.convertElement((/**@type {HTMLElement}*/(appRoot)), null);
        var /**demo.IComponent*/ component = conversionResult.component;
        if (demo.IApplicationFrame.isInstance(component)) {
          var /**demo.IApplicationFrame*/ applicationFrame = ((/**@type {demo.IApplicationFrame}*/(component)));
          applicationFrame.init();
          return applicationFrame;
        }
        return null;
      },
      
      /**
       * @return {demo.ConversionResult}
       * @private
       */
      'convertElement': function(/**HTMLElement*/ element, /**demo.IContainer*/ parent) {
        var /**demo.ConversionResult*/ conversionResult = this.convert(element);

        if (conversionResult !== null) {
          if (parent !== null) {
            parent.add(conversionResult.component);
          }

          if (!conversionResult.traverseChildren) {
            return conversionResult;
          }
        }

        var /**HTMLElement*/ convertedElement = conversionResult !== null && conversionResult.hasReplacement ? conversionResult.replacement : element;

        var /**demo.IContainer*/ nextParent = conversionResult !== null && demo.IContainer.isInstance(conversionResult.component) ? (/**@type {demo.IContainer}*/(conversionResult.component)) : parent;

        if (!(convertedElement.children)) {
          // this can happen for svg elements in IE
          return conversionResult;
        }

        var /**HTMLElement[]*/ arr;
        var /**number*/ i;
        for (i = 0, arr = convertedElement.children; i < arr.length; i++) {
          var /**HTMLElement*/ child = arr[i];
          if (child.nodeType === Node.ELEMENT_NODE) {
            this.convertElement(child, nextParent);
          }
        }
        return conversionResult;
      },
      
      /**
       * @return {demo.ConversionResult}
       * @private
       */
      'convert': function(/**HTMLElement*/ element) {
        var /**demo.ConversionResult*/ result = null;
        var /**string*/ type = element.getAttribute("data-type");

        if (yfiles.system.StringExtensions.stringEquals("application", type)) {
          result = this.backend.convertAppRoot(element, this.application);
        } else if (yfiles.system.StringExtensions.stringEquals("button", element.tagName.toLowerCase())) {
          if (yfiles.system.StringExtensions.stringEquals("ToggleButton", type)) {
            result = this.backend.convertToggleButton(element, this.application);
          } else {
            result = this.backend.convertButton(element, this.application);
          }
        } else if (element.hasAttribute("data-type")) {
          if (yfiles.system.StringExtensions.stringEquals("GraphControl", type)) {
            var /**yfiles.canvas.GraphControl*/ control = new yfiles.canvas.GraphControl.ForDiv((/**@type {HTMLDivElement}*/(element)));
            result = new demo.ConversionResult((/**@type {demo.IComponent}*/(control)));
          } else if (yfiles.system.StringExtensions.stringEquals("GraphOverviewControl", type)) {
            var /**yfiles.canvas.GraphOverviewControl*/ control = new yfiles.canvas.GraphOverviewControl();
            result = new demo.ConversionResult((/**@type {demo.IComponent}*/(control)));
            result.replacement = control.div;
            result.traverseChildren = false;

          } else if (yfiles.system.StringExtensions.stringEquals("CollapsiblePane", type)) {
            result = this.backend.convertCollapsiblePane(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("ComboBox", type)) {
            result = this.backend.convertComboBox(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("Panel", type)) {
            result = this.backend.convertPanel(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("Separator", type)) {
            result = this.backend.convertSeparator(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("ToolBar", type)) {
            result = this.backend.convertToolBar(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("ToggleButton", type)) {
            result = this.backend.convertToggleButton(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("TextArea", type)) {
            result = this.backend.convertTextArea(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("BorderLayout", type)) {
            result = this.backend.convertBorderLayout(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("Control", type)) {
            result = this.backend.convertControl(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("CheckBox", type)) {
            result = this.backend.convertCheckBox(element, this.application);
          } else if (yfiles.system.StringExtensions.stringEquals("FramerateCounter", type)) {
            result = this.backend.convertFramerateCounter(element, this.application);
          }
        }

        if (result !== null && result.hasReplacement) {
          var /**HTMLElement*/ origElement = element;
          var /**HTMLElement*/ replacement = result.replacement;

          demo.ApplicationParser.replaceElement(origElement, replacement);
        }

        if (element.hasAttribute("data-name")) {
          var dataObject = element;
          if (result !== null) {
            if (result.component !== null) {
              dataObject = result.component;
            } else if (result.hasReplacement) {
              dataObject = result.replacement;
            }
          }
          this.application.setProperty(element.getAttribute("data-name"), dataObject);
        }

        return result;
      },
      
      'bindCommands': function(/**demo.IComponent*/ component) {
        if (demo.ICommandComponent.isInstance(component)) {
          this.backend.bindCommand((/**@type {demo.ICommandComponent}*/(component)), this.application);
        }
        if (demo.IContainer.isInstance(component)) {
          ((/**@type {demo.IContainer}*/(component))).children.forEach((function(/**demo.IComponent*/ child) {
            this.bindCommands(child);
          }).bind(this));
        }
      },
      
      /** @lends {demo.ApplicationParser} */
      '$static': {
        'replaceElement': function(/**HTMLElement*/ origElement, /**HTMLElement*/ replacement) {
          origElement.parentNode.replaceChild(replacement, origElement);

          var /**NamedNodeMap*/ attrs = origElement.attributes;
          var /**number*/ length = attrs.length;
          for (var /**number*/ i = 0; i < length; i++) {
            var /**Attr*/ attr = (/**@type {Attr}*/(attrs.item(i)));
            if (!replacement.hasAttribute(attr.name)) {
              replacement.setAttribute(attr.name, attr.value);
            } else if ("class".equals(attr.name) && yfiles.system.StringExtensions.isNotEqual(attr.value, replacement.getAttribute(attr.name))) {
              replacement.setAttribute(attr.name, replacement.getAttribute(attr.name) + " " + attr.value);
            }
          }
        }
        
      }
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * Result of a conversion operation.
   * May contain a replacement DOM node and a Component that can be used to control the DOM node.
   * It also contains information on whether to process the children of the currently watched DOM node or not.
   * @class demo.ConversionResult
   */
  exports.ConversionResult = new yfiles.ClassDefinition(function() {
    /** @lends {demo.ConversionResult.prototype} */
    return {
      
      'constructor': function(/**demo.IComponent*/ component) {
        this.component = component;
        this.traverseChildren = true;
      },
      
      /** @type {HTMLElement} */
      'replacement': null,
      
      /** @type {boolean} */
      'traverseChildren': false,
      
      /** @type {demo.IComponent} */
      'component': null,
      
      /** @type {boolean} */
      'hasReplacement': {
        'get': function() {
          return this.replacement !== null;
        }
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IApplicationFrame
   * @implements {demo.IPanel}
   */
  exports.IApplicationFrame = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IApplicationFrame.prototype} */
    return {
      '$with': [demo.IPanel],
      
      /** @type {demo.IComponent} */
      'header': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {demo.IComponent} */
      'footer': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      'init': yfiles.lang.Abstract
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.ISeparator
   * @implements {demo.IComponent}
   */
  exports.ISeparator = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.ISeparator.prototype} */
    return {
      '$with': [demo.IComponent]
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.ICollapsiblePane
   * @implements {demo.IPanel}
   */
  exports.ICollapsiblePane = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.ICollapsiblePane.prototype} */
    return {
      '$with': [demo.IPanel],
      
      'collapse': yfiles.lang.Abstract,
      
      'expand': yfiles.lang.Abstract,
      
      /** @type {boolean} */
      'isExpanded': {
        'get': yfiles.lang.Abstract
      },
      
      /** @type {string} */
      'header': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {Element} */
      'content': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      },
      
      /** @type {demo.CollapseStyle} */
      'collapseStyle': {
        'get': yfiles.lang.Abstract,
        'set': yfiles.lang.Abstract
      }
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IComponent
   */
  exports.IComponent = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IComponent.prototype} */
    return {
      /** @type {Element} */
      'element': {
        'get': yfiles.lang.Abstract
      },
      
      'setSize': yfiles.lang.Abstract,
      
      'setSizeWithUnit': yfiles.lang.Abstract,
      
      'setLocation': yfiles.lang.Abstract,
      
      'setBounds': yfiles.lang.Abstract,
      
      /** @return {demo.ElementDimensions} */
      'getDimensions': yfiles.lang.Abstract,
      
      'setStyleProperty': yfiles.lang.Abstract
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IContainer
   * @implements {demo.IComponent}
   */
  exports.IContainer = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IContainer.prototype} */
    return {
      '$with': [demo.IComponent],
      
      /** @type {yfiles.collections.IEnumerable.<demo.IComponent>} */
      'children': {
        'get': yfiles.lang.Abstract
      },
      
      'add': yfiles.lang.Abstract,
      
      'remove': yfiles.lang.Abstract,
      
      'layoutChildren': yfiles.lang.Abstract
      
    };
  })


});
yfiles.module("demo", function(exports) {
  /**
   * @interface demo.IPanel
   * @implements {demo.IContainer}
   */
  exports.IPanel = new yfiles.InterfaceDefinition(function() {
    /** @lends {demo.IPanel.prototype} */
    return {
      '$with': [demo.IContainer]
      
    };
  })


});})(self);

});