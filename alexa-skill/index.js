/**
 * Alexa Skill: White Noise Player
 * --------------------------------
 * Plays a single white noise track on a continuous loop until the user
 * says "stop", "cancel", or "pause". No other functionality is included.
 *
 * Deployment requirements:
 *   1. npm install ask-sdk-core
 *   2. In the skill's manifest (Alexa developer console > Build > Interfaces),
 *      enable the "Audio Player" interface. Without this, AudioPlayer
 *      directives are rejected.
 */

const Alexa = require('ask-sdk-core');

// Pinned to a commit hash (rather than tracking the branch HEAD) so jsdelivr
// caches it as immutable for up to a year instead of revalidating against
// GitHub every 12 hours. Bump this hash if whitenoise.mp3 is ever replaced.
const AUDIO_URL = 'https://cdn.jsdelivr.net/gh/lewi6099/alexa-white-noise@6f93110439889b6340cbcc71a9523dace141fcee/whitenoise.mp3';
const AUDIO_TOKEN = 'white-noise-loop';

// Starts playback from the beginning when the skill is opened.
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', AUDIO_URL, AUDIO_TOKEN, 0, null)
      .withShouldEndSession(true)
      .getResponse();
  }
};

// Fires shortly before the stream ends. Re-enqueuing the same track
// makes it start again immediately, creating a seamless loop.
const PlaybackNearlyFinishedHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AudioPlayer.PlaybackNearlyFinished';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective(
        'ENQUEUE',
        AUDIO_URL,
        AUDIO_TOKEN,
        0,
        handlerInput.requestEnvelope.request.token
      )
      .getResponse();
  }
};

// Required AudioPlayer lifecycle events. No action needed, but Alexa
// expects an explicit (even if empty) response for each of these.
const PlaybackStartedHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

const PlaybackFinishedHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AudioPlayer.PlaybackFinished';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

const PlaybackStoppedHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

// Alexa does not automatically retry a stream after a playback error, so
// without this the skill goes silent until manually relaunched. Since this
// is an endless white noise loop with no meaningful position, it's always
// safe to just restart playback from the beginning.
const PlaybackFailedHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AudioPlayer.PlaybackFailed';
  },
  handle(handlerInput) {
    console.log('Playback failed:', JSON.stringify(handlerInput.requestEnvelope.request.error));
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', AUDIO_URL, AUDIO_TOKEN, 0, null)
      .getResponse();
  }
};

// Stops playback on "stop", "cancel", or "pause".
const StopPlaybackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && [
      'AMAZON.StopIntent',
      'AMAZON.CancelIntent',
      'AMAZON.PauseIntent'
    ].includes(request.intent.name);
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  }
};

// Restarts playback (from the beginning, since white noise has no
// meaningful position to resume from) on "resume".
const ResumePlaybackHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.ResumeIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', AUDIO_URL, AUDIO_TOKEN, 0, null)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('This skill plays looping white noise. Say stop at any time to end it.')
      .getResponse();
  }
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Sorry, I didn't understand that. Say stop to end the white noise.")
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log('Error handled:', error);
    return handlerInput.responseBuilder
      .speak('Sorry, something went wrong. Please try again.')
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    PlaybackNearlyFinishedHandler,
    PlaybackStartedHandler,
    PlaybackFinishedHandler,
    PlaybackStoppedHandler,
    PlaybackFailedHandler,
    StopPlaybackHandler,
    ResumePlaybackHandler,
    HelpIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
