const express = require("express");
const ordersService = require("../services/ordersService");

const router = express.Router();

function validationProblem(message, details) {
    return {
        error: {
            code: "VALIDATION_ERROR",
            message,
            details,
        },
    };
}

function notFoundProblem() {
    return {
        error: {
            code: "ORDER_NOT_FOUND",
            message: "Order not found",
        },
    };
}

router.get("/", (req, res) => {
    const responseBody = ordersService.getAllOrders();
    res.status(200).json(responseBody);
});

router.post("/", (req, res) => {
    const validationErrors = ordersService.validateCreateOrder(req.body);

    if (validationErrors.length > 0) {
        return res
            .status(400)
            .json(validationProblem("Invalid order", validationErrors));
    }

    const createdOrder = ordersService.createOrder(req.body);

    return res
        .status(201)
        .location(`/orders/${createdOrder.id}`)
        .json(createdOrder);
});

router.get("/:id", (req, res) => {
    const order = ordersService.getOrderById(req.params.id);

    if (!order) {
        return res.status(404).json(notFoundProblem());
    }

    return res.status(200).json(order);
});

router.delete("/:id", (req, res) => {
    const deleted = ordersService.deleteOrder(req.params.id);

    if (!deleted) {
        return res.status(404).json(notFoundProblem());
    }

    return res.status(204).send();
});

module.exports = router;