import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from 'openai';
import { nodePropsQuery, MAX_NUM_VALIDATION, relPropsQuery, relQuery, reportTypesToDesc } from './const';
import { ModelClient } from './ModelClient';

const consoleLogAsync = async (message: string, other?: any) => {
  await new Promise((resolve) => setTimeout(resolve, 0)).then(() => console.info(message, other));
};

export class OpenAiClient extends ModelClient {
  modelType: string | undefined;

  createSystemMessage: any;

  modelClient!: OpenAIApi;

  driver: any;

  constructor(settings) {
    super(settings);
  }

  async validateQuery(message, database) {
    let query = message.content;
    let isValid = false;
    let errorMessage = '';
    try {
      let res = await this.queryDatabase(`EXPLAIN ${query}`, database);
      isValid = true;
    } catch (e) {
      isValid = false;
      errorMessage = e.message;
    }
    return [isValid, errorMessage];
  }

  /**
   * Function used to create the OpenAiApi object.
   * */
  setModelClient() {
    const configuration = new Configuration({
      apiKey: this.apiKey,
    });
    this.modelClient = new OpenAIApi(configuration);
  }

  /**
   *
   * @param setIsAuthenticated If defined, is a function used to set the authentication result (for example, set function of a state variable)
   * @returns True if we client can authenticate, False otherwise
   */
  async authenticate(
    setIsAuthenticated = (boolean) => {
      let x = boolean;
    }
  ) {
    try {
      let tmp = await this.getListModels();
      // Can be used in async mode without awaiting
      // by passing down a function to set the authentication result
      setIsAuthenticated(tmp.length > 0);
      return tmp.length > 0;
    } catch (e) {
      consoleLogAsync('Authentication went wrong: ', e);
      return false;
    }
  }

  /**
   *  Used also to check authentication
   * @returns list of models available for this client
   */
  async getListModels() {
    let res;
    try {
      if (!this.modelClient) {
        throw new Error('no client defined');
      }
      let req = await this.modelClient.listModels();
      // Extracting the names
      res = req.data.data.map((x) => x.id).filter((x) => x.includes('gpt-3.5'));
    } catch (e) {
      consoleLogAsync('Error while loading the model list: ', e);
      res = [];
    }
    return res;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    this.modelClient = new OpenAIApi(configuration);
  }

  setDriver(driver) {
    this.driver = driver;
  }

  setListAvailableModels(listModels) {
    this.listAvailableModels = listModels;
  }

  setModelType(modelType) {
    this.modelType = modelType;
  }

  // TODO: adapt to the new structure, no more persisting inside the object, passign everything down
  addUserMessage(content, reportType, plain = false) {
    let finalMessage = `${content}. The Cypher RETURN clause must contained certain variables, in this case ${reportTypesToDesc[reportType]} Plain cypher code, no explanations and no unrequired symbols. Remember to respect the schema. Please remove any comment or explanation  from your result `;
    return { role: ChatCompletionRequestMessageRoleEnum.User, content: plain ? content : finalMessage };
  }

  addSystemMessage(content) {
    return { role: ChatCompletionRequestMessageRoleEnum.System, content: content };
  }

  addAssistantMessage(content) {
    return { role: ChatCompletionRequestMessageRoleEnum.Assistant, content: content };
  }

  addErrorMessage(error) {
    let finalMessage = `Please fix the query accordingly to this error: ${error}. Plain cypher code, no comments and no explanations and no unrequired symbols. Remember to respect the schema. Please remove any comment or explanation  from your result`;
    return { role: ChatCompletionRequestMessageRoleEnum.User, content: finalMessage };
  }

  async chatCompletion(history) {
    const completion = await this.modelClient.createChatCompletion({
      model: this.modelType,
      messages: history,
    });
    // If the status is correct
    if (completion.status == 200 && completion.data && completion.data.choices && completion.data.choices[0].message) {
      let { message } = completion.data.choices[0];
      return message;
    }
    throw Error(`Request returned with status: ${completion.status}`);
  }
}
