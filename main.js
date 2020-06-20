define([
        'jquery',
        'base/js/dialog',
        'base/js/events',
        'base/js/namespace',
        'notebook/js/celltoolbar',
        'notebook/js/codecell',
        'notebook/js/cell',
    ], function (
    $,
    dialog,
    events,
    Jupyter,
    celltoolbar,
    codecell,
    cell
    ) {
        "use strict";
        const gutterRed = `CodeMirror-crgutter-red`;
        const gutterGreen = `CodeMirror-crgutter-green`;
        const crGutters = [gutterRed, gutterGreen];
        const Cell = cell.Cell

        const setGutter = (cell, gutter) => {
            const gutters = cell.code_mirror.getOption('gutters').slice().filter((e) => !crGutters.includes(e));
            gutters.push(gutter);
            cell.code_mirror.setOption('gutters', gutters);
        }

        const isNotEditable = (cell) => cell.metadata.crIsEdited || cell.metadata.crIsSuggestion;

        const setSuggestion = (cell) => {
            cell.metadata.crIsSugestion = true;
            setGutter(cell, gutterGreen);
        }
        const setEdited = (cell) => {
            cell.metadata.crIsEdited = true;
            setGutter(cell, gutterRed);
        }

        const suggestEdit = () => {
            const selectedCells = Jupyter.notebook.get_selected_cells();
            if (selectedCells.some(isNotEditable)) {
                alert("Some of selected cells are already reviewed");
                return;
            }
            selectedCells.map(setEdited)
            Jupyter.notebook.copy_cell();
            Jupyter.notebook.paste_cell_below();
            selectedCells.forEach((_) => {
                setSuggestion(Jupyter.notebook.get_selected_cell());
                Jupyter.notebook.select_prev();
            });
            Jupyter.notebook.select_next();
        };


        const loadCss = function (style) {
            const el = document.createElement("style")
            el.innerHTML = style
            document.getElementsByTagName("head")[0].appendChild(el);
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
        };

        return {
            load_ipython_extension: loadIPythonExtension
        };
    }
);
