---
to: src/components/<%= Name %>/index.js
---
import React from "react";

import './index.css';

const <%= Name %> = () => {
    return (
        <div className="<%= h.changeCase.paramCase(name) %>">

        </div>
    );  
};

export default <%= Name %>;
