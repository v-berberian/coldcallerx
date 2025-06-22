console.log('Current localStorage keys:'); Object.keys(localStorage).filter(key => key.startsWith('coldcaller')).forEach(key => console.log(key, localStorage.getItem(key)));
