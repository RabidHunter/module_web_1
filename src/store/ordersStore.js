const orders = [];

function getAll() {
    return orders;
}

function getById(id) {
    return orders.find((order) => order.id === id);
}

function add(order) {
    orders.push(order);
    return order;
}

function removeById(id) {
    const index = orders.findIndex((order) => order.id === id);
    if (index === -1) {
        return false;
    }
    orders.splice(index, 1);
    return true;
}

module.exports = {
    getAll,
    getById,
    add,
    removeById,
};