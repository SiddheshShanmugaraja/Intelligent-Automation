
import  * as types from "../actions/types";

const initialState={
patients:{},
patinetObj:{},
patinetPriscription:[],
errors:null,
URL:'',
domainList:[],
goalList:[],
domainName:"",
newProject:false,
currentDomain:{},
removedDomain:{}
};
    

const trainingReducer = (state = initialState, action) => {

switch(action.type){
    
    case types.URL:{
        return {...state,URL:action.payload.url?action.payload.url:state.URL,domainName:action.payload.domainName,newProject:true}
    }
    case types.VIEW_DOMAIN:{

        return {...state,currentDomain:action.payload}
    }
     
    case types.REMOVE_DOMAIN:{
        return {...state,removedDomain:action.payload}
    }

    case types.REVERT_TRAINING_REDUCER:{
        return {...state,currentDomain:{},removedDomain:{}}
    }
    

    case types.UPDATE_URL_ELEMENT:{
        return {...state,domainList:action.payload}
    }
    case types.CREATE_GOAL:{
        return {...state,goalList:action.payload}
    }
    
    
 
    case types.CATCH_ERROR:{
        return {...state,errors:action.payload}
    }
    default:{
        return {...state,errors:null,newProject:false};
    }
}
}

export default trainingReducer;