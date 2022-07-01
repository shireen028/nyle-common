const { NyleLambda } = require('../aws');

const { createLocalLambda } = require('./createLocalLambda');

class NyleTestLambda {
    constructor({ name, handler, isLocal }) {
        const lambda = isLocal
            ? createLocalLambda({
                handler,
                functionName: name,
            })
            : new NyleLambda({ name });

        // RequestContext.withRequestId causes NyleLambdaHandler to invoke the AWS
        // callback before clearing the request context. In the cloud, behind the
        // scenes, lambda waits for the event loop to clear before sending a response.
        // (You can modify this: see the docs on context.callbackWaitsForEmptyEventLoop in
        // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html#nodejs-handler-sync
        // and https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html).
        // This method duplicates the "clear event loop" logic locally. Without
        // process.nextTick, if a lambda is invoked twice in succession, the request
        // context of the first invocation may not have been cleared by the time
        // the second calls RequestContext.withRequestId.
        const waitForRequestContextToClear = (invoke) => async (
            ev = {},
            context = {},
            callback = () => {},
        ) => {
            const event = {
                ...ev,
                __test: true,
            };
            if (!isLocal) return invoke(event, context, callback);
            let res;
            let error;
            try {
                res = await invoke(event, context, callback);
            } catch (err) {
                error = err;
            } finally {
                await new Promise((resolve) => process.nextTick(resolve));
            }
            if (error) throw error;
            return res;
        };

        this.invoke = waitForRequestContextToClear(lambda.invoke);
        this.invokeAsync = waitForRequestContextToClear(lambda.invokeAsync);
    }
}

module.exports = {
    NyleTestLambda,
};
