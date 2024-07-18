import { readFile } from "node:fs/promises";

import { AstBuilder, compile, GherkinClassicTokenMatcher, Parser } from "@cucumber/gherkin";
import { Query } from "@cucumber/gherkin-utils";
import { GherkinDocument, IdGenerator, parseEnvelope, Pickle } from "@cucumber/messages";
import _ from 'lodash';

const parser = new Parser (new AstBuilder(IdGenerator.incrementing()), new GherkinClassicTokenMatcher());

export interface ParsedFeatureFileData {
    featureFile: string;
    tags: string[][];
}

export const parseFeatueFile =async (featureFiles:string[]): Promise<ParsedFeatureFileData[]> => {
    const parsedRawData: ParsedFeatureFileData[] = [];
    for await (const featureFile of featureFiles) {
        const raw = await readFile(featureFile);
        const gherkinDocument:GherkinDocument = parser.parse(raw.toString());
        if(_.get(gherkinDocument, 'feature.keyword') !== 'feature'){
            throw new Error('Expected Gherkin document');
        }
        // Once the gherkin document is compiled, tags on the feature are combined with those on the scenarios.
        const pickles = compile(gherkinDocument, featureFile, IdGenerator.incrementing());
        const tags = pickles.map((Pickle) => Pickle.tags.map((tag)=> tag.name));
        try {
            parsedRawData.push({ featureFile, tags })
           } catch (error) {
            throw new Error (`Failed to parse ${featureFile}, error was: ${error}`);
        }
    }
    return Promise.resolve(parsedRawData);
}

export interface ParsedPickles {
    featureFile: string;
    scenarioName: string;
    tags: string;
    steps: string;
}

export const ParsedPickles = async (featureFiles:string[]): Promise<ParsedPickles[]> => {
    const parsedPickles: any[] = [];
    for await (const featureFile of featureFiles) {
        const raw = await readFile(featureFile);
        const gherkinDocument: GherkinDocument = parser.parse(raw.toString());
        if (_.get(gherkinDocument, 'feature.keyword') !== 'Feature') {
            throw new Error('Expected Gherkin document');
        }

        const compiledPickles = compile (gherkinDocument, featureFile, IdGenerator.incrementing());

        const pickles = compiledPickles.map((pickle) => {
            const scenarioName = pickle.name;
            const envelop = parseEnvelope(
                JSON.stringify({
                    gherkinDocument:{ ...gherkinDocument, uri: featureFile},
                    pickle
               })
            );
            const query = new Query().update(envelop);
            const steps = pickle.steps.map((step) => {
                const lineNumber = query.getLocation(step.astNodeIds[0]).line;
                return `${query.getStep(featureFile, lineNumber)?.keyword}${step.text}`;
            });
            const tags = pickle.tags.map((tag) => tag.name);
            return { featureFile, scenarioName, tags, steps }
        });
        parsedPickles.push(...pickles)
    }
    return Promise.resolve(parsedPickles)
};