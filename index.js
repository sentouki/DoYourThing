// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
const speechOutVar = require('./interactionModels/speechOutVariations.json')
const skillBuilder = Alexa.SkillBuilders.standard();

function setQuestion(handlerInput, questionAsked) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.questionAsked = questionAsked;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function selectRandom(array) {
  return array[Math.floor(Math.random()*array.length)];
}

function fixDate(date) {
  /* workaround: apparently if you don't specify the month or the year, 
      Alexa just fills them with X, e.g. XXXX-XX-15
      instead we want to fill the missing dates with the current year and month
  */
 if (!date.includes("X")) return date;
 const currentYear = new Date().getFullYear();
 var month = new Date().getMonth + 1;
 if (month.length == 1) month = `0${month}`;
 const currentMonth = month;
 return date.replace("XXXX", currentYear).replace("XX", currentMonth);
}

const CreateTodoIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const IntentName = 'CreateTodoIntent';
    return(request.type === 'IntentRequest'
        && request.intent.name === IntentName);
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const oldData = await handlerInput.attributesManager.getPersistentAttributes();
    const _data = {};   // inner JSON object, contains data from slots
    var data = {};           // outer JSON object, containt inner JSON object and unique key
    const date = fixDate(slots.todoDate.value);
    const key = `${slots.todoAction.value}+${date}+${slots.todoTime.value}`;
    _data.action = slots.todoAction.value;
    _data.date = date;
    _data.time = slots.todoTime.value;
    data[key] = _data;
    data = Object.assign({}, data, oldData);
    handlerInput.attributesManager.setPersistentAttributes(data);
    await handlerInput.attributesManager.savePersistentAttributes(data);

    const speechOutput = selectRandom(speechOutVar[IntentName]);

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  }
};


const OverviewTodoIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const IntentName = 'OverviewTodoIntent';
    return(request.type === 'IntentRequest'
        && request.intent.name === IntentName);
  },
  async handle(handlerInput) {
    const oldData = await handlerInput.attributesManager.getPersistentAttributes();
    var count = Object.keys(oldData).length;
    //console.log(oldData);
    var ToDos = [];
    for (var i = 0; i < count; i++) {
      ToDos.push(Object.values(oldData)[i].action);
    }
    console.log(ToDos);
    if (ToDos.length > 7) {
      var speechOutput = selectRandom(speechOutVar[intentName]["long"] + speechOutVar[intentName]["basic"]);
    } else {
      var speechOutput = selectRandom(speechOutVar[intentName]["basic"]);
    }
    ToDos.forEach(todo => speechOutput+= ', '+todo);
    console.log(speechOutput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  }
};

const TodoToDateIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const IntentName = 'TodoToDateIntent';
    return(request.type === 'IntentRequest'
        && request.intent.name === IntentName);
  },
  async handle(handlerInput)  {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const toDate = Date.parse(slots.toDate.value);
    const today =  new Date();
    console.log(`toDate ${toDate}`)
    const oldData = await handlerInput.attributesManager.getPersistentAttributes();
    var count = Object.keys(oldData).length;
    var ToDos = [];
    for (var i = 0; i < count; i++) {
      if(Date.parse(Object.values(oldData)[i].date) <= toDate && Date.parse(Object.values(oldData)[i].date) >= today)  {
        console.log(`OldDate: ${Date.parse((Object.values(oldData)[i].date))}`)
        ToDos.push(Object.values(oldData)[i].action);
      }
    }
    if (ToDos.length != 0) 
      var speechOutput = selectRandom(speechOutVar[IntentName]["hasToDos"]);
    else 
      var speechOutput = selectRandom(speechOutVar[IntentName]["hasnoToDos"]);
    ToDos.forEach(todo => speechOutput+= ', '+todo);
    console.log(speechOutput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  }
};

const DeleteTodoIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const IntentName = 'DeleteTodoIntent';
    return(request.type === 'IntentRequest'
        && request.intent.name === IntentName);
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const oldData = await handlerInput.attributesManager.getPersistentAttributes();
    const key = `${slots.DeleteAction.value}+${slots.DeleteDate.value}+${slots.DeleteTime.value}`;
    var speechOutput;
    if (oldData[key]) {
      delete oldData[key];
      speechOutput = selectRandom(speechOutVar[IntentName]["success"]);
      handlerInput.attributesManager.setPersistentAttributes(oldData);
      await handlerInput.attributesManager.savePersistentAttributes(oldData);
    }
    else {
      speechOutput = selectRandom(speechOutVar[IntentName]["notfound"]);
    }
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  }
};

const DoneTodoIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const IntentName = 'DoneTodoIntent';
    return(request.type === 'IntentRequest'
        && request.intent.name === IntentName);
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const oldData = await handlerInput.attributesManager.getPersistentAttributes();
    const key = `${slots.DeleteAction.value}+${slots.DeleteDate.value}+${slots.DeleteTime.value}`;
    var speechOutput;
    if (oldData[key]) {
      delete oldData[key];
      speechOutput = selectRandom(speechOutVar[IntentName]["success"]);
      handlerInput.attributesManager.setPersistentAttributes(oldData);
      await handlerInput.attributesManager.savePersistentAttributes(oldData);
    }
    else {
      speechOutput = selectRandom(speechOutVar[IntentName]["notfound"]);
    }
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },

  async handle(handlerInput) {
      const oldData = await handlerInput.attributesManager.getPersistentAttributes();
      var count = Object.keys(oldData).length;
      var speechText = selectRandom(speechOutVar["LaunchRequest"]);
      console.log(`DATA counter: ${count}`);
      if (!count) 
      {
        speechText = 'Willkommen bei tu du. Sag "Alexa, hilfe", um zu erfahren, was ich kann';
      }
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
    
};

const YesIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {

  }

};

const NoIntentHandler = {
  canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
          && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
  }
};

const HelpIntentHandler = {
  // TODO: intent überarbeiten, um dem user sinnvolle hilfe und übersicht über die vorhandenen intents zu geben
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
      const speechText = selectRandom(speechOutVar["HelpIntent"]);

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
   handle(handlerInput) {
      const speechText = selectRandom(speechOutVar["StopIntent"]);
      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
      // Any cleanup logic goes here.
      return handlerInput.responseBuilder.getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`~~~~ Error handled: ${error.message}`);
      const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest';
  },
  handle(handlerInput) {
    const intentName = handlerInput.requestEnvelope.request.intent.name;
    const speechText = `You just triggered ${intentName}`;

    return handlerInput.responseBuilder
      .speak(speechText)
      //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
      .getResponse();
 }
};


// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    CreateTodoIntentHandler,
    DeleteTodoIntentHandler,
    DoneTodoIntentHandler,
    OverviewTodoIntentHandler,
    TodoToDateIntentHandler,
    IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  .addErrorHandlers(
    ErrorHandler)
  .withTableName("tasks")
  .withAutoCreateTable(true)
  .lambda();
