const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/users", auth.validateUser, async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({
            user,
            token
        });
    } catch (e) {
        res.status(400).send({
            "error": "User not created"
        });
    }
});

router.post("/users/login", auth.validateUser, async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();
        res.send({
            user,
            token
        });
    } catch (e) {
        res.status(400).send();
    }
});

router.patch('/users/me', auth.auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["scoreRnd", "scoreSales", "scoreProduction", "scoreFinance", "currentQuestion", "company"];
    const isValidOperation = updates.every(update =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).send({
            error: "Invalid updates!"
        });
    }
    
    try {
        updates.forEach(update => {
            if(update == "company") {
                if(!req.user.company) {
                    req.user.company = req.body.company
                } else {
                    res.status(400).send({
                        error: "Company already set."
                    })
                }
            } else {
                if(update.includes("score")) {
                    req.user[update] += req.body[update]
                }
                else {
                    req.user[update] = req.body[update]
                }
            }
        });
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400);
    }
})

router.post("/users/logout", auth.auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.get("/users/me", auth.auth, async (req, res) => {
    res.send(req.user);
});


module.exports = router;