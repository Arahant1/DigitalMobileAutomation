const unitTestEnum = {
    USER_TYPE: "USER_TYPE"
};

const directWealthOptimizationPackEnum = {
    NOMESSAGE_USER: 'NOMESSAGES_USER'
}

export const DesiredUserTypeEnum = {
    ...unitTestEnum,
    ...directWealthOptimizationPackEnum
}as const;