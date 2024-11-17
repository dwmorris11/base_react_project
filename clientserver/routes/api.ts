/**
 * @file api.ts
 * @description This file contains the API routes for the client server.
 * @version 1.0.0
 * @date 2023-10-05
 * 
 * @author Dustin Morris
 */

import { express, axios, constants, defaultHeaders, uuiv4, handleResponse, checkSession, addCommonHeaders } from '../common_imports.js';
import { sizeLimit, xssCheck } from '../middleware/middleware.js';
import er from '../errors.js';


interface ChatObject {
    question: string;
}

interface FeedbackObject {
    feedback: string;
    feedbackId: string;
    question: string;
    response: string;
    responseTime: number;
}

const ax = axios.default;
const api = express.Router();

api.post('*', sizeLimit);
api.use(xssCheck);

api.post('/chat', (req, res) => {
    if (!req.body.question) {
        res.status(400).send('No question provided');
        // TODO: Add logging here
    };

    const question: ChatObject = req.body;
    let options = addCommonHeaders(req);

    checkSession(res, options.headers['dash2labs-session-id']);
    

    ax.post(`${constants.server}/api/chat`, question, options).then((response) => {
        handleResponse(res, response, options.headers['correlation-id']);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.post('/feedback', (req, res) => {
    if (!req.body.feedback) {
        res.status(400).send('No feedback provided');
        // TODO: Add logging here
        return;
    };
    const feedback: FeedbackObject = req.body;
    let options = addCommonHeaders(req);

    ax.post(`${constants.server}/api/feedback`, feedback, options).then((response) => {
        handleResponse(res, response, options.headers['correlation-id']);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.get('/history', (req, res) => {
    let options = addCommonHeaders(req);
    checkSession(res, options.headers['dash2labs-session-id']);

    ax.get(`${constants.server}/api/history`, options).then((response) => {
        handleResponse(res, response, options.headers['correlation-id']);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.get('/settings', (req, res) => {
    let options = addCommonHeaders(req);
    checkSession(res, options.headers['dash2labs-session-id']);

    ax.get(`${constants.server}/api/settings`, options).then((response) => {
        handleResponse(res, response, options.headers['correlation-id']);
    }).catch(() => {
        res.status(500).send(er.serverError);
        // TODO: Add logging here
    });
});

api.post('/settings', (req, res) => {
    if (!req.body.settings) {
        res.status(400).send('No settings provided');
        // TODO: Add logging here
    };

    const settings = req.body;
    let options = addCommonHeaders(req);
    checkSession(res, options.headers['dash2labs-session-id']);


    if (constants.useAuth) {
        ax.post(`${constants.server}/api/settings`, settings, options).then((response) => {
            handleResponse(res, response, options.headers['correlation-id']);
        }).catch(() => {
            res.status(500).send(er.serverError);
            // TODO: Add logging here
        });
    } else {
        res.status(403).send(er.userError);
        // TODO: Add logging here
    };
});

export default api;