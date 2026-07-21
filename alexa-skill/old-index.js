// No-op handlers for AudioPlayer events
const PlaybackStartedHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        return requestType === 'AudioPlayer.PlaybackStarted';
    },
    handle(handlerInput) {
        console.log('PlaybackStartedHandler handling request:', JSON.stringify(handlerInput.requestEnvelope));
        return handlerInput.responseBuilder.getResponse();
    }
};

const PlaybackFinishedHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        return requestType === 'AudioPlayer.PlaybackFinished';
    },
    handle(handlerInput) {
        console.log('PlaybackFinishedHandler handling request:', JSON.stringify(handlerInput.requestEnvelope));
        return handlerInput.responseBuilder.getResponse();
    }
};

const PlaybackStoppedHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        return requestType === 'AudioPlayer.PlaybackStopped';
    },
    handle(handlerInput) {
        console.log('PlaybackStoppedHandler handling request:', JSON.stringify(handlerInput.requestEnvelope));
        return handlerInput.responseBuilder.getResponse();
    }
};

const PlaybackFailedHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        return requestType === 'AudioPlayer.PlaybackFailed';
    },
    handle(handlerInput) {
        console.log('PlaybackFailedHandler handling request:', JSON.stringify(handlerInput.requestEnvelope));
        return handlerInput.responseBuilder.getResponse();
    }
};
const Alexa = require('ask-sdk-core');

const AUDIO_URL = "https://cdn.jsdelivr.net/gh/lewi6099/alexa-white-noise/whitenoise.mp3";
const TOKEN = "whitenoise-token";

const PlayHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        let intentName = undefined;
        if (requestType === 'IntentRequest') {
            intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        }
        console.log('PlayHandler canHandle check:', { requestType, intentName });
        return requestType === 'LaunchRequest'
            || (requestType === 'IntentRequest' && intentName === 'PlayNoiseIntent');
    },
    handle(handlerInput) {
        console.log('PlayHandler handling request:', JSON.stringify(handlerInput.requestEnvelope));
        return handlerInput.responseBuilder
            .addAudioPlayerPlayDirective('REPLACE_ALL', AUDIO_URL, TOKEN, 0, null)
            .getResponse();
    }
};

const LoopHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        console.log('LoopHandler canHandle check:', { requestType });
        return requestType === 'AudioPlayer.PlaybackNearlyFinished';
    },
    handle(handlerInput) {
        console.log('LoopHandler handling request:', JSON.stringify(handlerInput.requestEnvelope));
        return handlerInput.responseBuilder
            .addAudioPlayerPlayDirective(
                'ENQUEUE',
                AUDIO_URL,
                TOKEN + Date.now(),
                0,
                TOKEN
            )
            .getResponse();
    }
};

const StopHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        let intentName = undefined;
        if (requestType === 'IntentRequest') {
            intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        }
        console.log('StopHandler canHandle check:', { requestType, intentName });
        return requestType === 'IntentRequest'
            && (intentName === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        console.log('StopHandler handling request:', JSON.stringify(handlerInput.requestEnvelope));
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .getResponse();
    }
};

const FallbackHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        let intentName = undefined;
        if (requestType === 'IntentRequest') {
            intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        }
        console.log('FallbackHandler canHandle check:', { requestType, intentName });
        return requestType === 'IntentRequest'
            && intentName === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        console.log('FallbackHandler handling request:', JSON.stringify(handlerInput.requestEnvelope));
        return handlerInput.responseBuilder
            .speak("Sorry, I didn't understand that. You can say 'play white noise' to start.")
            .reprompt("You can say 'play white noise' to start.")
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
        console.log('SessionEndedRequestHandler canHandle check:', { requestType });
        return requestType === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log('SessionEndedRequestHandler handling request:', JSON.stringify(handlerInput.requestEnvelope));
        // Cleanup logic can go here
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log('ErrorHandler caught error:', error);
        if (handlerInput && handlerInput.requestEnvelope) {
            console.log('ErrorHandler requestEnvelope:', JSON.stringify(handlerInput.requestEnvelope));
        }
        return handlerInput.responseBuilder
            .speak("Sorry, I had trouble doing what you asked. Please try again.")
            .reprompt("Please try again.")
            .getResponse();
    }
};

// Log every incoming request at the entry point
const LoggingRequestInterceptor = {
    process(handlerInput) {
        console.log('Incoming request:', JSON.stringify(handlerInput.requestEnvelope));
    }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        PlayHandler,
        LoopHandler,
        StopHandler,
        PlaybackStartedHandler,
        PlaybackFinishedHandler,
        PlaybackStoppedHandler,
        PlaybackFailedHandler,
        FallbackHandler,
        SessionEndedRequestHandler
    )
    .addRequestInterceptors(LoggingRequestInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda();