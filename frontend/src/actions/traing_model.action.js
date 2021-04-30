import * as types from "./types";
 import { baseUrlMl,headers, } from "../config";
import Axios from 'axios'

  
export const getSiteMaps = (obj) => {
  return Axios.post(baseUrlMl + `/get_sites`,obj,headers).then(res=>{
             return {payload:res} 
         }) 
 
}

export const extractSitemap = (obj) => {
  return Axios.post(baseUrlMl + `/extract_sitemap`,obj,headers).then(res=>{
             return {payload:res} 
         }) 
}

export const getTrainingStatus = (obj) => {
    return Axios.get(baseUrlMl + `/get_training_status`,obj,headers).then(res=>{
               return {payload:res} 
           }) 
  }
 

export const startTraining = (obj) => {

    return Axios.post( baseUrlMl + `/train_data`,obj,headers).then(res=>{
  
               return res
           }) 
   
  }
    
