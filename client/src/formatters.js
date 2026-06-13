export const formatDate = (date,format = 'short') =>{
    if(!date) return '';

    const d = new Date(date);
    const options = {
        full:{weekday:'long',year:'numeric',month:'long',day:'numeric'},
        short: {month:'short',day:'numeric',year:'numeric',hour:'2-digit',second:'2-digit',minute:'2-digit'},
    };

    return d.toLocaleDateString('en-US',options[format] || options.short);
};

export const formatCurrency = (amount) =>{
    return new Intl.NumberFormat('en-US',{
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

export const formatNumber = (num) =>{
    return new Intl.NumberFormat('en-US').format(num);
};

export const formatTestParameter = (param)=>{
    if (!param || !param.name || !param.value) return '';
    const unit = param.unit ? ` ${param.unit}` : '';
    return `${param.name}: ${param.value}${unit}`;
};

export const validateResultsFormatter = (results)=>{
    if (!results || !Array.isArray(results)) {
        return { valid: false, message: 'No results available', invalidEntries: [] };
    }

    const invalidEntries = results.filter(r => !r || typeof r.value === 'undefined' || r.value === null);
    if (invalidEntries.length > 0) {
        return {
            valid: false,
            message: `${invalidEntries.length} invalid test result(s)`,
            invalidEntries,
        };
    }

    return { valid: true, message: 'All results validated', entries: results };
};

export const getInitials = (name)=>{
    return name.split(/\s+/).map(word =>word.charAt(0)).join('').toUpperCase();
};

export const formatTime = (date) =>{
    if(!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
};