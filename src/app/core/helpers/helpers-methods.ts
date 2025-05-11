export const removeNullishFieldsParams = (params: Record<any, any> = {}) => {
    Object.entries(params).forEach(([key, value]) => {
        if (
            value === null ||
            value === undefined ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
        ) {
            delete params[key];
        }
    });

    return params;
};

function buildFormData(
    formData: FormData,
    data: Record<any, any>,
    parentKey = ''
) {
    if (
        data &&
        typeof data === 'object' &&
        !(data instanceof Date) &&
        !(data instanceof File) &&
        !(data instanceof Blob)
    ) {
        Object.keys(data).forEach((key) => {
            buildFormData(
                formData,
                data[key],
                parentKey ? `${parentKey}[${key}]` : key
            );
        });
    } else {
        let value: any = data;
        if (data && !(data instanceof String) && !(data instanceof Blob)) {
            value = data.toString();
        }
        formData.append(parentKey, value);
    }
}

export const convertTimestampToISO = (timestamp) => {
    const date = new Date(timestamp);
    date.setDate(date.getDate() + 1);
    let isoString = date.toISOString();
    let [datePart, timePart] = isoString.split('T');

    return datePart;
};

export const createFormData = (payload: Record<any, any>) => {
    const formdata = new FormData();

    buildFormData(formdata, removeNullishFieldsParams(payload));

    return formdata;
};
