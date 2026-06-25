import { config } from "./config.js";

export type Subaccount = "garage" | "pool";

export interface StageMap {
  NEW_LEAD?: string;
  CONTACTED?: string;
  QUOTED?: string;
  SCHEDULED?: string;
  WON?: string;
  LOST?: string;
}

export interface SubaccountConfig {
  name: Subaccount;
  token?: string;
  locationId?: string;
  pipelineId?: string;
  stages: StageMap;
}

export function getSubaccountConfig(name: Subaccount): SubaccountConfig {
  if (name === "garage") {
    return {
      name,
      token: config.GHL_API_KEY_GARAGE,
      locationId: config.GHL_LOCATION_ID_GARAGE,
      pipelineId: config.GHL_PIPELINE_ID_GARAGE,
      stages: {
        NEW_LEAD: config.GHL_STAGE_ID_GARAGE_NEW_LEAD,
        CONTACTED: config.GHL_STAGE_ID_GARAGE_CONTACTED,
        QUOTED: config.GHL_STAGE_ID_GARAGE_QUOTED,
        SCHEDULED: config.GHL_STAGE_ID_GARAGE_SCHEDULED,
        WON: config.GHL_STAGE_ID_GARAGE_WON,
        LOST: config.GHL_STAGE_ID_GARAGE_LOST,
      },
    };
  }

  return {
    name,
    token: config.GHL_API_KEY_POOL,
    locationId: config.GHL_LOCATION_ID_POOL,
    pipelineId: config.GHL_PIPELINE_ID_POOL,
    stages: {
      NEW_LEAD: config.GHL_STAGE_ID_POOL_NEW_LEAD,
      CONTACTED: config.GHL_STAGE_ID_POOL_CONTACTED,
      QUOTED: config.GHL_STAGE_ID_POOL_QUOTED,
      SCHEDULED: config.GHL_STAGE_ID_POOL_SCHEDULED,
      WON: config.GHL_STAGE_ID_POOL_WON,
      LOST: config.GHL_STAGE_ID_POOL_LOST,
    },
  };
}

export function assertSubaccountHasToken(name: Subaccount): string {
  const token = getSubaccountConfig(name).token;
  if (!token) {
    throw new Error(`GHL_NOT_CONFIGURED: missing token for subaccount=${name}`);
  }
  return token;
}
