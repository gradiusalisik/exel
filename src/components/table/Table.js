import {ExcelComponent} from '@core/ExcelComponent';
import {$} from '@core/dom';
import {createTable} from './table.template';
import {resizeHandler} from './table.resize';
import {isCell, shouldResize, matrix, nextSelector} from './table.functions';
import {TableSelection} from './TableSelection';

export class Table extends ExcelComponent {
  static className = 'table';
  constructor($root, options) {
    super($root, {
      name: 'Table',
      listeners: ['mousedown', 'keydown', 'input'],
      ...options
    })
  }

  toHTML() {
    return createTable(20);
  }

  prepare() {
    this.selection = new TableSelection(this.$root);
  }

  init() {
    super.init();

    const $cell = this.$root.find('[data-id="0:0"]');
    this.selectCell($cell);

    this.$on('formula:input', text => {
      this.selection.current.text(text);
    })

    this.$on('formula:done', () => {
      this.selection.current.focus()
    })
    // get ColState
    // const {colState} = this.$getState();
    // const keys = Object.keys(colState);
    // this.$root.findAll(`[data-col]`).forEach(col => {
    //   const id = $(col).data.col;
    //   if (keys.includes(id)) {
    //     console.log(colState[id], 'colSTate')
    //     $(col).css({
    //       width: `${colState[id]}px`
    //     })
    //   }
    // })

    // this.$subscribe(({colState}) => {

    // })
  }

  onInput(event) {
    this.$emit('table:input', $(event.target).text());
  }

  selectCell($cell) {
    this.selection.select($cell);
    this.$emit('table:select', $cell);
  }

  onMousedown(event) {
    if (shouldResize(event)) {
      resizeHandler(this.$root, event);
    } else if (isCell(event)) {
      const $target = $(event.target);
      if (event.shiftKey) {
        const $cells = matrix($target, this.selection.current)
            .map(id => this.$root.find(`[data-id="${id}"]`));

        this.selection.selectGroup($cells);
      } else {
        this.selection.clear();
        this.selection.select($target);
      }
    }
  }

  onKeydown(event) {
    const keys = [
      'Enter',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'ArrowDown',
      'ArrowUp',
    ];

    const {key} = event;

    if (keys.includes(key) && !event.shiftKey) {
      event.preventDefault();
      const id = this.selection.current.id(true);
      const $next = this.$root.find(nextSelector(key, id));
      this.selectCell($next);
    }
  }
}

