/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import SplitCellCommand from '../../src/commands/splitcellcommand';
import { defaultConversion, defaultSchema, formatTable, formattedModelTable, modelTable } from '../_utils/utils';
import TableUtils from '../../src/tableutils';

describe('SplitCellCommand', () => {
  let editor, model, command;

  beforeEach(() => {
    return ModelTestEditor.create({
      plugins: [TableUtils],
    }).then(newEditor => {
      editor = newEditor;
      model = editor.model;
      command = new SplitCellCommand(editor);

      defaultSchema(model.schema);
      defaultConversion(editor.conversion);
    });
  });

  afterEach(() => {
    return editor.destroy();
  });

  describe('direction=vertically', () => {
    beforeEach(() => {
      command = new SplitCellCommand(editor, { direction: 'vertically' });
    });

    describe('isEnabled', () => {
      it('should be true if in a table cell', () => {
        setData(model, modelTable([['00[]']]));

        expect(command.isEnabled).to.be.true;
      });

      it('should be false if not in cell', () => {
        setData(model, '<paragraph>11[]</paragraph>');

        expect(command.isEnabled).to.be.false;
      });
    });

    describe('execute()', () => {
      it('should split table cell for two table cells', () => {
        setData(
          model,
          modelTable([
            ['00', '01', '02'],
            ['10', '[]11', '12'],
            ['20', { colspan: 2, contents: '21' }],
            [{ colspan: 2, contents: '30' }, '32'],
          ])
        );

        command.execute();

        expect(formatTable(getData(model))).to.equal(
          formattedModelTable([
            ['00', { colspan: 2, contents: '01' }, '02'],
            ['10', '[]11', '', '12'],
            ['20', { colspan: 3, contents: '21' }],
            [{ colspan: 3, contents: '30' }, '32'],
          ])
        );
      });

      it('should unsplit table cell if split is equal to colspan', () => {
        setData(
          model,
          modelTable([
            ['00', '01', '02'],
            ['10', '11', '12'],
            ['20', { colspan: 2, contents: '21[]' }],
            [{ colspan: 2, contents: '30' }, '32'],
          ])
        );

        command.execute();

        expect(formatTable(getData(model))).to.equal(
          formattedModelTable([
            ['00', '01', '02'],
            ['10', '11', '12'],
            ['20', '21[]', ''],
            [{ colspan: 2, contents: '30' }, '32'],
          ])
        );
      });

      it('should properly unsplit table cell if split is uneven', () => {
        setData(model, modelTable([['00', '01', '02'], [{ colspan: 3, contents: '10[]' }]]));

        command.execute();

        expect(formatTable(getData(model))).to.equal(
          formattedModelTable([['00', '01', '02'], [{ colspan: 2, contents: '10[]' }, '']])
        );
      });

      it('should properly set colspan of inserted cells', () => {
        setData(model, modelTable([['00', '01', '02', '03'], [{ colspan: 4, contents: '10[]' }]]));

        command.execute();

        expect(formatTable(getData(model))).to.equal(
          formattedModelTable([
            ['00', '01', '02', '03'],
            [{ colspan: 2, contents: '10[]' }, { colspan: 2, contents: '' }],
          ])
        );
      });

      it('should keep rowspan attribute for newly inserted cells', () => {
        setData(
          model,
          modelTable([
            ['00', '01', '02', '03', '04', '05'],
            [{ colspan: 5, rowspan: 2, contents: '10[]' }, '15'],
            ['25'],
          ])
        );

        command.execute();

        expect(formatTable(getData(model))).to.equal(
          formattedModelTable([
            ['00', '01', '02', '03', '04', '05'],
            [{ colspan: 3, rowspan: 2, contents: '10[]' }, { colspan: 2, rowspan: 2, contents: '' }, '15'],
            ['25'],
          ])
        );
      });
    });
  });

  describe('direction=horizontally', () => {
    beforeEach(() => {
      command = new SplitCellCommand(editor, { direction: 'horizontally' });
    });

    describe('isEnabled', () => {
      it('should be true if in a table cell', () => {
        setData(model, modelTable([['00[]']]));

        expect(command.isEnabled).to.be.true;
      });

      it('should be false if not in cell', () => {
        setData(model, '<paragraph>11[]</paragraph>');

        expect(command.isEnabled).to.be.false;
      });
    });

    describe('execute()', () => {
      it('should split table cell for two table cells', () => {
        setData(model, modelTable([['00', '01', '02'], ['10', '[]11', '12'], ['20', '21', '22']]));

        command.execute();

        expect(formatTable(getData(model))).to.equal(
          formattedModelTable([
            ['00', '01', '02'],
            [{ rowspan: 2, contents: '10' }, '[]11', { rowspan: 2, contents: '12' }],
            [''],
            ['20', '21', '22'],
          ])
        );
      });
    });
  });
});
