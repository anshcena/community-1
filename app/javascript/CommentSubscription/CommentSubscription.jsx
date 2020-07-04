import { h } from 'preact';
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  Dropdown,
  FormField,
  RadioButton,
} from '@crayons';

function getInitialState(initialSubscriptionType, subscribed) {
  const initialSubscribe =
    initialSubscriptionType &&
    (initialSubscriptionType.length > 0 && initialSubscriptionType) !==
      COMMENT_SUBSCRIPTION_TYPE.NOT_SUBSCRIBED;

  const initialState = {
    subscriptionType: subscribed
      ? initialSubscriptionType
      : COMMENT_SUBSCRIPTION_TYPE.ALL,
    subscribed: initialSubscribe,
    showOptions: false,
  };

  return initialState;
}

export const COMMENT_SUBSCRIPTION_TYPE = Object.freeze({
  ALL: 'all_comments',
  TOP: 'top_level_comments',
  AUTHOR: 'only_author_comments',
  NOT_SUBSCRIBED: 'not_subscribed',
});

const CogIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    role="img"
    aria-labelledby="ai2ols8ka2ohfp0z568lj68ic2du21s"
    className="crayons-icon"
  >
    <title id="ai2ols8ka2ohfp0z568lj68ic2du21s">Preferences</title>
    <path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 110-8 4 4 0 010 8zm0-2a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

// TODO: Fix param in JSDoc for default value.

/**
 * Comment subscription for an article.
 *
 * @param props The component's props.
 * @param {string} [props.positionType=relative] The CSS position.
 * @param {Function} [props.onSubscribe] Callback to subuscribe from comments of an article.
 * @param {Function} props.onUnsubscribe Callback to unsubuscribe from comments of an article.
 * @param {string} props.initialSubscriptionTypeThe type of comment subscription.
 */
export function CommentSubscription({
  positionType = 'relative',
  onSubscribe,
  onUnsubscribe,
  initialSubscriptionType,
}) {
  function commentSubscriptionClick(event) {
    setState({
      subscribed,
      showOptions,
      subscriptionType: event.target.value,
    });
  }

  function dropdownPlacementHandler(dropdownElement) {
    // Reset the top before doing any calculations
    dropdownElement.style.bottom = '';

    const { bottom: dropDownBottom } = dropdownElement.getBoundingClientRect();
    const { height } = buttonGroupRef.current.base.getBoundingClientRect();

    if (
      Math.sign(dropDownBottom) === -1 ||
      dropDownBottom > window.innerHeight
    ) {
      // The 4 pixels is the box shadow from the drop down.
      dropdownElement.style.bottom = `${height + 4}px`;
    }
  }

  const initialState = getInitialState(initialSubscriptionType, subscribed);
  const [state, setState] = useState(initialState);
  const { showOptions, subscriptionType, subscribed } = state;

  const buttonGroupRef = useRef(null);
  const buttonGroupRefCallback = useCallback((element) => {
    buttonGroupRef.current = element;
  }, []);

  const dropdownRef = useRef(null);
  const dropdownRefCallback = useCallback((element) => {
    dropdownRef.current = element;
  }, []);

  useEffect(() => {
    const { current } = dropdownRef;

    if (!current) {
      return;
    }

    const scrollHandler = ((dropdownElement) => {
      return () => dropdownPlacementHandler(dropdownElement);
    })(current.base);

    if (showOptions) {
      window.addEventListener('scroll', scrollHandler);
      scrollHandler();
    } else {
      window.removeEventListener('scroll', scrollHandler);
    }

    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [showOptions, subscribed, subscriptionType]);

  return (
    <div className={positionType}>
      <ButtonGroup ref={buttonGroupRefCallback}>
        <Button
          variant="outlined"
          onClick={(_event) => {
            if (subscribed) {
              onUnsubscribe(COMMENT_SUBSCRIPTION_TYPE.NOT_SUBSCRIBED);
              setState({
                showOptions,
                subscribed,
                subscriptionType: COMMENT_SUBSCRIPTION_TYPE.ALL,
              });
            } else {
              onSubscribe(subscriptionType);
            }

            setState({
              showOptions,
              subscribed: !subscribed,
              subscriptionType,
            });
          }}
        >
          {subscribed ? 'Unsubscribe' : 'Subscribe'}
        </Button>
        {subscribed && (
          <Button
            data-testid="subscription-settings"
            variant="outlined"
            icon={CogIcon}
            contentType="icon"
            onClick={(_event) => {
              setState({
                showOptions: !showOptions,
                subscribed,
                subscriptionType,
              });
            }}
          />
        )}
      </ButtonGroup>
      {subscribed && (
        <Dropdown
          data-testid="subscriptions-panel"
          aria-hidden={!showOptions}
          className={
            showOptions
              ? `inline-block z-30 right-4 left-4 s:right-0 s:left-auto${
                  positionType === 'relative' ? ' w-full' : ''
                }`
              : null
          }
          ref={dropdownRefCallback}
        >
          <div className="crayons-fields mb-5">
            <FormField variant="radio">
              <RadioButton
                id="subscribe-all"
                name="subscribe_comments"
                value={COMMENT_SUBSCRIPTION_TYPE.ALL}
                checked={subscriptionType === COMMENT_SUBSCRIPTION_TYPE.ALL}
                onClick={commentSubscriptionClick}
              />
              <label htmlFor="subscribe-all" className="crayons-field__label">
                All comments
                <p className="crayons-field__description">
                  You’ll receive notifications for all new comments.
                </p>
              </label>
            </FormField>

            <FormField variant="radio">
              <RadioButton
                id="subscribe-toplevel"
                name="subscribe_comments"
                value={COMMENT_SUBSCRIPTION_TYPE.TOP}
                onClick={commentSubscriptionClick}
                checked={subscriptionType === COMMENT_SUBSCRIPTION_TYPE.TOP}
              />
              <label
                htmlFor="subscribe-toplevel"
                className="crayons-field__label"
              >
                Top-level comments
                <p className="crayons-field__description">
                  You’ll receive notifications only for all new top-level
                  comments.
                </p>
              </label>
            </FormField>

            <FormField variant="radio">
              <RadioButton
                id="subscribe-author"
                name="subscribe_comments"
                value={COMMENT_SUBSCRIPTION_TYPE.AUTHOR}
                onClick={commentSubscriptionClick}
                checked={subscriptionType === COMMENT_SUBSCRIPTION_TYPE.AUTHOR}
              />
              <label
                htmlFor="subscribe-author"
                className="crayons-field__label"
              >
                Post author comments
                <p className="crayons-field__description">
                  You’ll receive notifications only if post author sends a new
                  comment.
                </p>
              </label>
            </FormField>
          </div>

          <Button
            className="w-100"
            onClick={(_event) => {
              onSubscribe(subscriptionType);

              setState({
                subscribed,
                subscriptionType,
                showOptions: false,
              });
            }}
          >
            Done
          </Button>
        </Dropdown>
      )}
    </div>
  );
}

CommentSubscription.displayName = 'CommentSubscription';

CommentSubscription.propTypes = {
  positionType: PropTypes.oneOf(['absolute', 'relative', 'static']).isRequired,
  onSubscribe: PropTypes.func.isRequired,
  onUnsubscribe: PropTypes.func.isRequired,
  initialSubscriptionType: PropTypes.oneOf(
    Object.entries(COMMENT_SUBSCRIPTION_TYPE).map(([, value]) => value),
  ).isRequired,
};
