import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertVideo, isVideoAllowed } from '../video/utils';

/**
 * @module video/videoupload/videouploadcommand
 */

/**
 * The video upload command.
 *
 * The command is registered by the {@link module:video/videoupload/videouploadediting~VideoUploadEditing} plugin as `'videoUpload'`.
 *
 * In order to upload an video at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionPosition} algorithm),
 * execute the command and pass the native video file instance:
 *
 *		this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
 *			// Assuming that only videos were pasted:
 *			const videos = Array.from( data.dataTransfer.files );
 *
 *			// Upload the first video:
 *			editor.execute( 'videoUpload', { file: videos[ 0 ] } );
 *		} );
 *
 * It is also possible to insert multiple videos at once:
 *
 *		editor.execute( 'videoUpload', {
 *			file: [
 *				file1,
 *				file2
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class VideoUploadCommand extends Command {
  /**
   * @inheritDoc
   */
  refresh() {
    this.isEnabled = isVideoAllowed(this.editor.model);
  }

  /**
   * Executes the command.
   *
   * @fires execute
   * @param {Object} options Options for the executed command.
   * @param {File|Array.<File>} options.file The video file or an array of video files to upload.
   */
  execute(options) {
    const editor = this.editor;
    const model = editor.model;

    const fileRepository = editor.plugins.get(FileRepository);

    model.change(writer => {
      const filesToUpload = Array.isArray(options.file) ? options.file : [options.file];

      for (const file of filesToUpload) {
        uploadVideo(writer, model, fileRepository, file);
      }
    });
  }
}

// Handles uploading single file.
//
// @param {module:engine/model/writer~writer} writer
// @param {module:engine/model/model~Model} model
// @param {File} file
function uploadVideo(writer, model, fileRepository, file) {
  const loader = fileRepository.createLoader(file);

  // Do not throw when upload adapter is not set. FileRepository will log an error anyway.
  if (!loader) {
    return;
  }

  insertVideo(writer, model, { uploadId: loader.id });
}
