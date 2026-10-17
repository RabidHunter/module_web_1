const { randomUUID } = require("node:crypto");
const ordersStore = require("../store/ordersStore");

const DEFAULT_ORDER_STATUS = "created";

function makeOrderId() {
    return `ord-${randomUUID().slice(0, 8)}`;
}

function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateTotal(items) {
    return roundMoney(
        items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    );
}

function copyItem(item) {
    return {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
    };
}

function formatOrderResponse(order) {
    return {
        id: order.id,
        customerName: order.customerName,
        items: order.items.map(copyItem),
        total: order.total,
        status: order.status,
    };
}

function normalizeItems(items) {
    return items.map((item) => ({
        name: item.name.trim(),
        quantity: item.quantity,
        price: item.price,
    }));
}

function validateCreateOrder(body) {
    const problems = [];

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        problems.push("Request body must be a JSON object");
        return problems;
    }

    if (
        typeof body.customerName !== "string" ||
        body.customerName.trim().length === 0
    ) {
        problems.push("customerName is required");
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
        problems.push("At least one item is required");
        return problems;
    }

    body.items.forEach((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            problems.push(`items[${index}] must be an object`);
            return;
        }

        if (typeof item.name !== "string" || item.name.trim().length === 0) {
            problems.push(`items[${index}].name is required`);
        }

        if (
            typeof item.quantity !== "number" ||
            !Number.isFinite(item.quantity) ||
            item.quantity <= 0
        ) {
            problems.push(`items[${index}].quantity must be greater than zero`);
        }

        if (
            typeof item.price !== "number" ||
            !Number.isFinite(item.price) ||
            item.price <= 0
        ) {
            problems.push(`items[${index}].price must be greater than zero`);
        }
    });

    return problems;
}

function getAllOrders() {
    const rawOrders = ordersStore.getAll();
    const formattedOrders = rawOrders.map(formatOrderResponse);
    return {
        orders: formattedOrders,
        count: formattedOrders.length,
    };
}

function getOrderById(id) {
    const order = ordersStore.getById(id);
    if (!order) return null;
    return formatOrderResponse(order);
}

function createOrder(data) {
    const normalizedCustomerName = data.customerName.trim();
    const items = normalizeItems(data.items);
    const total = calculateTotal(items);

    const newOrder = {
        id: makeOrderId(),
        customerName: normalizedCustomerName,
        items,
        total,
        status: DEFAULT_ORDER_STATUS,
        createdAt: new Date().toISOString(),
    };

    ordersStore.add(newOrder);
    return formatOrderResponse(newOrder);
}

function deleteOrder(id) {
    return ordersStore.removeById(id);
}

module.exports = {
    validateCreateOrder,
    getAllOrders,
    getOrderById,
    createOrder,
    deleteOrder,
};