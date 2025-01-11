function getDate(dates, lang) {
    if (dates === 0) return lang.never;
    const date = new Date(dates);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

module.exports = { getDate };