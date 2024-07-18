import fs from 'node:fs/promises';
import path from 'node:path';

import _ from 'lodash';

import { FailureCategorizationEnum } from '../enums/failureCategorization.enum.js';
import logger from './logger.js';

// The function called cartesianProduct is a utility that accepts several arrays as input and computes their cartesian product. It implement the reduce method 
// tp iterate through each inputs array, combining them into the cartesian product by flattening the previously accoumalted array with current onemptied.
// The function initializes with an empty array to handle the case where no input array are provided. its output is an array of arrays, where each sub array contains one lement from eachinput array, covering all possible
// combinations.

export const cartesianProduct = (...args: any[])=>
Array.prototype.reduce.call(args, (acc: any[], x:any[])=> _.flatten(acc.map((accElement)=>x.map((xElement) => accElement.concat([xElement])))),[[]]);

export const getAllFilesInDir =  async (dirPath: string, extn: string )=> {
    let allFiles: string[] = [];
    const files = await fs.readdir(dirPath);
    for(const file of files){
        const filePath = path.join(dirPath, file);
        const fileStat = await fs.stat(filePath);
        
        if(fileStat.isDirectory()){
            const dirFiles = await getAllFilesInDir(filePath, extn);
            allFiles = [...allFiles, ...dirFiles];
        }else if (fileStat.isFile() && file.endsWith(extn)) {
            allFiles.push(filePath);
            
        }
    }
    return allFiles;

};

export const resetTemDir = async () => {
    const files = await getAllFilesInDir(path.resolve('./temp/'), 'json');
    return await Promise.all(files.map(async (file) => await fs.unlink(file))); 
};

export const maskFields = (obectToMask: any, fieldsToMask: string[])=>{
    // Actual => let clonedObject = null;
    let clonedObject;
    if(obectToMask) {
        clonedObject = { ...obectToMask};
        for (const fieldToMask of fieldsToMask) {
            if(clonedObject[fieldToMask]){
                clonedObject[fieldToMask]= '*******';
            }
            
        }
        
    } 
    return clonedObject;

};

export const categorizeFailure = (testStatus?: 'passed' | 'failed', errorMessage?: string)=>{
    let errorCategory: string | undefined = undefined;

    if (testStatus !== 'passed'){
        try {
            // categorized error based on the error message
            for (const [key, value] of Object.entries(FailureCategorizationEnum)) {
                 if (value.some((message: string)=> errorMessage?.includes(message))){
                    errorCategory = key;
                    break;
                }              
            }          
        } catch (error) {
            logger.error(error);
            errorCategory ='UNCLASSIFIED_ERROR';
            
        }
    }
    return errorCategory;
}