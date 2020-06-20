define([
        'jquery',
        'base/js/dialog',
        'base/js/events',
        'base/js/namespace',
    ], function (
    $,
    dialog,
    events,
    Jupyter,
    ) {
        "use strict";
        const gutterRed = `CodeMirror-crgutter-red`;
        const gutterGreen = `CodeMirror-crgutter-green`;
        const crGutters = [gutterRed, gutterGreen];

        const setGutter = (cell, gutter) => {
            const gutters = cell.code_mirror.getOption('gutters').slice().filter((e) => !crGutters.includes(e));
            gutters.push(gutter);
            cell.code_mirror.setOption('gutters', gutters);
        }

        const isNotEditable = (cell) => cell.metadata.crIsEdited || cell.metadata.crIsSuggestion;

        const setEdited = (cell) => {
            const id = randomId()
            cell.metadata.crIsEdited = true;
            cell.metadata.crId = id;
            setGutter(cell, gutterRed);
            return id;
        }

        const setSuggestion = (cell, id) => {
            cell.metadata.crIsSugestion = true;
            cell.metadata.crId = id;
            setGutter(cell, gutterGreen);
        }

        const suggestEdit = () => {
            const selectedCells = Jupyter.notebook.get_selected_cells();
            if (selectedCells.some(isNotEditable)) {
                alert("Some of selected cells are already reviewed");
                return;
            }
            const ids = selectedCells.map(setEdited);
            Jupyter.notebook.copy_cell();
            Jupyter.notebook.paste_cell_below();
            ids.reverse().forEach((id) => {
                setSuggestion(Jupyter.notebook.get_selected_cell(), id);
                Jupyter.notebook.select_prev();
            });
            Jupyter.notebook.select_next();
        };

        const loadIPythonExtension = () => {
            const crGutterStyle = `.${gutterRed} {width: 0.5em;background-color: red;} .${gutterGreen} {width: 0.5em;background-color: green;}`;
            loadCss(crGutterStyle)
            // register action
            const suggestEditAction = {
                icon: 'fa-bug',
                help: 'Suggest an edit',
                help_index: 'zz',
                handler: suggestEdit
            };
            const suggestEditActionName =
                Jupyter.notebook.keyboard_manager.actions.register(suggestEditAction, 'suggest-edit', 'code-review');
            Jupyter.toolbar.add_buttons_group([suggestEditActionName]);

            events.on("delete.Cell", () => {
                alert("ahah");
            });
            events.on("paste.Cell", () => {
                alert("ahah");
            });
            events.on("delete.Cell", () => {
                alert("ahah");
            });
            events.on("kernel_ready.Kernel", () => {
                Jupyter.notebook.get_cells().forEach((cell, idx, cells) => {
                    if (cell.metadata.crIsEdited) setGutter(cell, gutterRed);
                    else if (cell.metadata.crIsSugestion) setGutter(cell, gutterGreen);
                });
            });

        };

        const loadCss = function (style) {
            const el = document.createElement("style")
            el.innerHTML = style
            document.getElementsByTagName("head")[0].appendChild(el);
        };

        const randomId = () => '_' + Math.random().toString(36).substr(2, 9);

        return {
            load_ipython_extension: loadIPythonExtension
        };
    }
);
