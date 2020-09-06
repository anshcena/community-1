import { addSnackbarItem } from '../../Snackbar';
import { processImageUpload } from '../actions';

const IS_UPLOADING_PLACEHOLDER_TEXT = '\n![Uploading...]()\n';

export function insertMarkdownLink({
  element,
  alternateText,
  imageUrl,
  isUploading = false,
}) {
  const markdownImageLink = isUploading
    ? IS_UPLOADING_PLACEHOLDER_TEXT
    : `\n![${alternateText}](${imageUrl})\n`;
  const { selectionStart, selectionEnd, value } = element;
  const uploadTextRemovedDelta =
    isUploading || selectionStart === 0
      ? 0
      : IS_UPLOADING_PLACEHOLDER_TEXT.length;
  const before = value.substring(0, selectionStart - uploadTextRemovedDelta);
  const after = value.substring(selectionEnd, value.length);

  element.value = `${before + markdownImageLink}${after}`;
  element.selectionStart =
    selectionStart + markdownImageLink.length - uploadTextRemovedDelta;
  element.selectionEnd = element.selectionStart;
}

/**
 * Determines if at least one type of drag and drop datum type matches the data transfer type to match.
 *
 * @param {string[]} types An array of data transfer types.
 * @param {string} dataTransferType The data transfer type to match.
 */
export function matchesDataTransferType(
  types = [],
  dataTransferType = 'Files',
) {
  return types.some((type) => type === dataTransferType);
}

// TODO: Document functions
export function handleImageDrop(handleImageSuccess, handleImageFailure) {
  return function (event) {
    const imageUploadContext =
      event instanceof ClipboardEvent
        ? event.clipboardData
        : event.dataTransfer;
    const { types, files } = imageUploadContext;

    if (!matchesDataTransferType(types)) {
      return;
    }

    insertMarkdownLink({
      element: event.currentTarget,
      isUploading: true,
    });

    // Only prevent the default action if we know we are dealing with files
    event.preventDefault();

    event.currentTarget.classList.remove('opacity-25');

    if (files.length > 1) {
      addSnackbarItem({
        message: 'Only one image can be dropped at a time.',
        addCloseButton: true,
      });
      return;
    }

    processImageUpload(files, handleImageSuccess, handleImageFailure);
  };
}

/**
 * Dragover handler for the editor
 *
 * @param {DragEvent} event the drag event.
 */
export function onDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('opacity-25');
}

/**
 * DragExit handler for the editor
 *
 * @param {DragEvent} event the drag event.
 */
export function onDragExit(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('opacity-25');
}

/**
 * Handler for when image upload fails.
 *
 * @param {Error} error an error
 * @param {string} error.message an error message
 */
export function handleImageFailure({ message }) {
  addSnackbarItem({
    message,
    addCloseButton: true,
  });
}
