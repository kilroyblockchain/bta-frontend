export const encodeString = (data: string): string | void => {
    try {
        return window.btoa(data);
    } catch (err) {
        return;
    }
};

export const decodeString = (encodedString: string): string | void => {
    try {
        return window.atob(encodedString);
    } catch (err) {
        return;
    }
};

export const encodeJSON = (data: any): string | void => {
    try {
        const stringified = JSON.stringify(data);
        return window.btoa(stringified);
    } catch (err) {
        return;
    }
};

export const decodeJSON = (encodedString: string): any => {
    try {
        const stringified = window.atob(encodedString);
        const jsonObject = JSON.parse(stringified);
        return jsonObject;
    } catch (err) {
        return;
    }
};
