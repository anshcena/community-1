import { h } from 'preact';
import { useEffect, useRef, useReducer } from 'preact/hooks';
import PropTypes from 'prop-types';
import { CogIcon } from '../icons/CogIcon';
import {
  Button,
  ButtonGroup,
  Dropdown,
  FormField,
  RadioButton,
} from '@crayons';

function getInitialSubscriptionType(subscriptionType) {
  const subscribed = Object.values(COMMENT_SUBSCRIPTION_TYPE).includes(
    subscriptionType,
  );

  return subscribed
    ? subscriptionType
    : COMMENT_SUBSCRIPTION_TYPE.NOT_SUBSCRIBED;
}

function getScrollHandler(dropdownElement, heightAdjustment) {
  return () => {
    // Reset the top before doing any calculations
    dropdownElement.style.bottom = '';

    const { bottom } = dropdownElement.getBoundingClientRect();

    if (Math.sign(bottom) === -1 || bottom > window.innerHeight) {
      // The 4 pixels is the box shadow from the drop down.
      dropdownElement.style.bottom = `${heightAdjustment + 4}px`;
    }
  };
}

function commentSubscription(state, { type, payload }) {
  switch (type) {
    case ACTION_TYPE.SUBSCRIPTION:
      return { ...state, subscriptionType: payload };

    case ACTION_TYPE.SHOW_OPTIONS:
      return { ...state, showOptions: payload };

    default:
      // An invalid action, so just return the current state.
      return state;
  }
}

const ACTION_TYPE = Object.freeze({
  SUBSCRIPTION: 'SUBSCRIPTION',
  SHOW_OPTIONS: 'SHOW_OPTIONS',
});

export const COMMENT_SUBSCRIPTION_TYPE = Object.freeze({
  ALL: 'all_comments',
  TOP: 'top_level_comments',
  AUTHOR: 'only_author_comments',
  NOT_SUBSCRIBED: 'not_subscribed',
});

/**
 * Comment subscription for an article.
 *
 * @param props The component's props.
 * @param {string} [props.positionType=relative] The CSS position.
 * @param {Function} [props.onSubscribe] Callback to subscribe from comments of an article.
 * @param {Function} props.onUnsubscribe Callback to unsbuscribe from comments of an article.
 * @param {string} props.initialSubscriptionTypeThe type of comment subscription.
 */
export function CommentSubscription({
  positionType = 'relative',
  onSubscribe,
  onUnsubscribe,
  initialSubscriptionType,
}) {
  function commentSubscriptionClick(event) {
    dispatch({
      type: ACTION_TYPE.SUBSCRIPTION,
      payload: event.target.value,
    });
  }

  const initialState = {
    subscriptionType: getInitialSubscriptionType(initialSubscriptionType),
    showOptions: false,
  };
  const [state, dispatch] = useReducer(commentSubscription, initialState);
  const { showOptions, subscriptionType } = state;
  const subscribed =
    subscriptionType !== COMMENT_SUBSCRIPTION_TYPE.NOT_SUBSCRIBED;
  const buttonGroupRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const { current } = dropdownRef;

    if (!current) {
      return;
    }

    const { height } = buttonGroupRef.current.base.getBoundingClientRect();
    const scrollHandler = getScrollHandler(current.base, height);
    debugger;
    if (showOptions) {
      window.addEventListener('scroll', scrollHandler);
      scrollHandler();
    } else {
      window.removeEventListener('scroll', scrollHandler);
    }

    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [showOptions]);

  return (
    <div className={positionType}>
      <ButtonGroup ref={buttonGroupRef}>
        <Button
          variant="outlined"
          onClick={(_event) => {
            if (subscribed) {
              onUnsubscribe(COMMENT_SUBSCRIPTION_TYPE.NOT_SUBSCRIBED);
            } else {
              onSubscribe(COMMENT_SUBSCRIPTION_TYPE.ALL);
            }

            dispatch({
              type: ACTION_TYPE.SUBSCRIPTION,
              payload: subscribed
                ? COMMENT_SUBSCRIPTION_TYPE.NOT_SUBSCRIBED
                : COMMENT_SUBSCRIPTION_TYPE.ALL,
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
              dispatch({
                type: ACTION_TYPE.SHOW_OPTIONS,
                payload: !showOptions,
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
          ref={dropdownRef}
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

              dispatch({
                type: ACTION_TYPE.SHOW_OPTIONS,
                payload: false,
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
