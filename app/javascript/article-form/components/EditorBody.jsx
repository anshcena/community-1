import { h } from 'preact';
import PropTypes from 'prop-types';
import Textarea from 'preact-textarea-autosize';
import { useEffect, useRef } from 'preact/hooks';
import { Toolbar } from './Toolbar';
import {
  handleImageDrop,
  handleImageFailure,
  onDragOver,
  onDragExit,
  insertMarkdownLink,
} from './dragAndDropHelpers';
import { useDragAndDrop } from '@utilities/dragAndDrop';

function handleImageSuccess(textAreaRef) {
  return function (response) {
    // Function is within the component to be able to access
    // textarea ref.
    const editableBodyElement = textAreaRef.current.base;
    const {
      links,
      // Set the default name to image in the event the browser does not
      // provide the file name.
      image: [image = { name: 'image' }],
    } = response;
    const alternateText = image.name.replace(/\.[^.]+$/, '');

    insertMarkdownLink({
      element: editableBodyElement,
      alternateText,
      imageUrl: links[0],
    });

    // Dispatching a new event so that linkstate, https://github.com/developit/linkstate,
    // the function used to create the onChange prop gets called correctly.
    editableBodyElement.dispatchEvent(new Event('input'));
  };
}

export const EditorBody = ({
  onChange,
  defaultValue,
  switchHelpContext,
  version,
}) => {
  const textAreaRef = useRef(null);
  const imageUploadHandler = handleImageDrop(
    handleImageSuccess(textAreaRef),
    handleImageFailure,
  );
  const { setElement } = useDragAndDrop({
    onDrop: imageUploadHandler,
    onDragOver,
    onDragExit,
  });

  useEffect(() => {
    const element = textAreaRef.current ? textAreaRef.current.base : null;

    if (element) {
      setElement(element);
      element.addEventListener('paste', imageUploadHandler);
    }

    return () => {
      element && element.removeEventListener('paste', imageUploadHandler);
    };
  }, [setElement, imageUploadHandler]);

  return (
    <div
      data-testid="article-form__body"
      className="crayons-article-form__body text-padding"
    >
      <Toolbar version={version} />

      <Textarea
        className="crayons-textfield crayons-textfield--ghost crayons-article-form__body__field"
        id="article_body_markdown"
        aria-label="Post Content"
        placeholder="Write your post content here..."
        value={defaultValue}
        onInput={onChange}
        onFocus={(_event) => {
          switchHelpContext(_event);
        }}
        name="body_markdown"
        ref={textAreaRef}
      />
    </div>
  );
};

EditorBody.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string.isRequired,
  switchHelpContext: PropTypes.func.isRequired,
  version: PropTypes.string.isRequired,
};

EditorBody.displayName = 'EditorBody';
