/**
 * @file Session.ts
 * @description This file contains the Session class which handles user sessions.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */
import { v4 as uuidv4 } from 'uuid';
import Chat from './Chat.js';
import Feedback from './Feedback.js';
import History from './History.js';
import User from '../Models/User.js';
import { constants } from '../constants.js';
import AuthorizationError from '../Authorization/Errors/AuthorizationError.js';
import SessionError from './Errors/SessionError.js';
import Communicator from './Communicator.js';
import { ChatObject } from './Chat.js';
import { FeedbackObject } from './Feedback.js';
import { HistoryObject } from './History.js';

class Session {
    private _chat!: Chat;
    private _feedback!: Feedback;
    private _history!: History;
    private _user!: User;
    private _session_id!: string;
    private _communicator!: Communicator;
    
    constructor(session_id: string | undefined) {
        try {
            this.initialize(session_id);
        }
        catch (error) {
            if (constants.debug) {
                console.error(error);
            }
            else {
                if (error instanceof Error) {
                    throw new SessionError("Session initialization failed: " + error.message + " " + error.stack);
                } else {
                    throw new SessionError("Session initialization failed: Unknown error");
                }
            }
        }
    }

    /**
     * @description This is a callback function for the ui to send a chat message
     */
    public sendChat(question: ChatObject) {
        return this._chat.sendQuestion(question);
    }

    /**
     * @description This is a callback function for the ui to send feedback
     */
    public sendFeedback(feedback: FeedbackObject) {
        return this._feedback.sendFeedback(feedback);
    }

    /**
     * @description This is a callback function for the ui to get the history
     */
    public getHistory(): HistoryObject {
        return this._history.getHistory();
    }

    /**
     *@description This is a callback function for the ui to get configuration settings  
     */
     public getSettings() {
    }

    /**
     *@description This is a callback function for the ui to set configuration settings  
     */
     public setSettings() {
    }

    // TODO: Since we are setting configuration for the user we should be able to save their configuration
    // TODO: These callbacks should be in implented in the ui and not here
    // /**
    //  * @description This is a callback function for the client to request the user sign in from the ui
    //  */
    // public requestSignIn() {
    // }

    // /**
    //  * @description This is a callback function for the client to request the user sign out from the ui
    //  */
    // public requestSignOut() {
    // }

    private initialize(session_id: string | undefined) {
        this.initializeUser();
        if (this._user) {
            if(session_id) {
                this._session_id = session_id;  //TODO: validate session id
            }
            else {
                this._session_id = uuidv4();  // ui didn't give us a session id so we create a new one
            }
            this._communicator = new Communicator(this._session_id, this._user.user_id as string);
            this.initializeHandlers();
        }
        else {
            throw new AuthorizationError("User not authorized");
        }
    }

    private initializeUser() {
        if (!this._user && constants.useauth)
        {
            this._user = new User(false); // populate user from auth
        }
        this._user = new User(true); // anonymous user
    }

    private initializeHandlers() {
        if (!this._session_id) {
            throw new SessionError("Session ID not defined"); // This should never happen
        }
        else if (!this._user || !this._user.user_id) {
            throw new SessionError("User not defined"); // This should never happen
        }
        else {
            this._chat = new Chat(this._communicator);
            this._feedback = new Feedback(this._communicator);
            this._history = new History(this._communicator);
        }
    }
}

export default Session;