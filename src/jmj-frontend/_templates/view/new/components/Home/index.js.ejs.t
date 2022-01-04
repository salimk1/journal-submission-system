---
to: src/views/<%= Name %>/components/Home/index.js
---
import React from "react";

import './index.css';

const <%= Name %>Home = () => {

    return (
        <div className="<%= h.changeCase.paramCase(name) %>-home">
           <%= Name %> home
        </div>       
    );  
};

export default <%= Name %>Home;