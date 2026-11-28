import crypto from "crypto";
import Subject from "../models/subject.js";

const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateJoiningCode = async () => {
  while (true) {
    let code = "";

    for (let i = 0; i < 6; i++) {
      code += letters[crypto.randomInt(letters.length)];
    }

    // Make sure no other subject already has this code
    const alreadyUsed = await Subject.exists({ joiningCode: code });

    if (!alreadyUsed) {
      return code;
    }
  }
};