import { Router, type Request, type Response } from "express";
// import Zod validators
import {
  zUserId,
  zItemId,
  zItemPostBody,
  zItemPutBody,
  zItemDeleteBody
} from "../libs/zodValidators.js";
// import types
import type { Item } from "../libs/types.ts";
// import database
import { items } from "../db/db.ts";
//import uuid
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from "@src/middlewares/authenMiddleware.js";
import { checkRoleMiddleware } from "@src/middlewares/checkRoleMiddleware.js";
import { type CustomRequest } from "../libs/types.ts";
import { success, uuid } from "zod";

const router = Router();

// GET /api/vXXX/items/:userId 
router.get("/:userId",authenticateToken,checkRoleMiddleware,(req:CustomRequest , res: Response) => {
  try{
    const userId = req.params.userId;
    const user = req.user;

    const result = zUserId.safeParse(userId);
    if(!result.success){
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: result.error.issues[0].message
      });
    }

    if(user?.userId!==userId){
      return res.status(403).json({
        success: false,
        message: "Forbidden access"
      });
    }

    const userItems = items.filter((i)=> i.userId===userId);
    if(!userItems){
      return res.status(404).json({
        success: false,
        message: `items for user ID ${userId} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: [userItems]
    });
  }catch(err){
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err
    });
  }
});

// POST /api/vXXX/items/:userId, body = {new item data}
// add a new Item for userId
router.post("/:userId",authenticateToken,checkRoleMiddleware,async (req: CustomRequest, res: Response) => {
  try{
    const userId = req.params.userId;
    const user = req.user;

    const result = zUserId.safeParse(userId);
    if(!result.success){
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: result.error.issues[0].message
      });
    }

    if(user?.userId!==userId){
      return res.status(403).json({
        success: false,
        message: "Forbidden access"
      });
    }

    const {prodect_name,unit_price,quantity,category} = req.body;
    const newItem:Item = {
      userId: userId,
      itemId: uuidv4(),
      product_name: prodect_name,
      unit_price: unit_price,
      quantity: quantity,
      category: category
    };

    items.push(newItem);
    
    return res.status(201).json({
      success: true,
      Message: "New Item has been added successfully",
      data: newItem
    });
  }catch(err){
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err
    });
  }
});

// Delete /api/vXXX/items/:userId


export default router;