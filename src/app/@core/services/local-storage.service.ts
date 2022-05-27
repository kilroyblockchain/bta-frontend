/* eslint-disable @typescript-eslint/no-explicit-any */
import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';

const ENCRYPT_SECRET_KEY = 'PqaFh1ql*a0X';
@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    deleteLocalStorage = (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (err: any) {
            console.error(err.message);
        }
    };

    setLocalStorageData = (key: string, data: any): void => {
        try {
            const value = JSON.stringify(this.encryptData(JSON.stringify(data)));
            localStorage.setItem(key, value);
        } catch (err: any) {
            console.error(err.message);
        }
    };

    getLocalStorageData = (key: string): any => {
        try {
            const localData = localStorage.getItem(key);
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    return this.decryptData(data);
                } catch (err) {
                    return null;
                }
            }
        } catch (err: any) {
            console.error(err.message);
            return null;
        }
    };

    clearAllLocalStorageData = (): void => {
        try {
            localStorage.clear();
        } catch (err: any) {
            console.error(err.message);
        }
    };

    encryptData = (data: any): string | void => {
        try {
            return CryptoJS.AES.encrypt(data, ENCRYPT_SECRET_KEY).toString();
        } catch (e) {
            console.log(e);
        }
    };

    decryptData = (data: any): any => {
        try {
            if (data) {
                const bytes = CryptoJS.AES.decrypt(data, ENCRYPT_SECRET_KEY);
                if (bytes.toString()) {
                    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                }
            }
            return data;
        } catch (e) {
            console.log(e);
        }
    };
}
