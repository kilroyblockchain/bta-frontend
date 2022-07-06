import { API_RES_MSG_APP_FEATURES } from './app-features.constant';
import { API_RES_MSG_COMMON } from './common.constant';
import { API_RES_MSG_COUNTRY } from './country.constant';
import { API_RES_MSG_ORGANIZATION_STAFFING } from './organization-staffing.constant';
import { API_RES_MSG_ORGANIZATION_UNIT } from './organization-unit.constant';
import { API_RES_MSG_ORGANIZATION } from './organization.constant';
import { API_RES_MSG_SUBSCRIPTION_TYPE } from './subscription-type.constant';
import { API_RES_MSG_MANAGE_PROJECT } from './manage-project.constant';
import { API_RES_MSG_USER } from './user.constant';
import { API_RES_MSG_BLOCKCHAIN } from './blockchain.constant';

const ALL_API_RES_MSG_EN = {
    ...API_RES_MSG_APP_FEATURES,
    ...API_RES_MSG_COMMON,
    ...API_RES_MSG_COUNTRY,
    ...API_RES_MSG_ORGANIZATION_STAFFING,
    ...API_RES_MSG_ORGANIZATION_UNIT,
    ...API_RES_MSG_ORGANIZATION,
    ...API_RES_MSG_SUBSCRIPTION_TYPE,
    ...API_RES_MSG_USER,
    ...API_RES_MSG_MANAGE_PROJECT,
    ...API_RES_MSG_BLOCKCHAIN
};

export { ALL_API_RES_MSG_EN };
