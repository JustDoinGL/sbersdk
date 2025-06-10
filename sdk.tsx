const pathSegments = window.location.pathname.split('/');
if (pathSegments.includes('bank-partner')) {
    console.log('Один из сегментов пути — "bank-partner"');
}