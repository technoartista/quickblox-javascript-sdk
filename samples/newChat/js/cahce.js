'use strict';

/*
 * cache object use dialogId as key. will have an array on messages and total count of messages.
 * */

function CACHE () {
    this._dialogs = {
    /* EXAMPLE OF CACHED DATA
    *   messageId: {
    *       count: Number,
    *       messages: [ Object ],
*           users: [ Number ],
*           draft: [ String ]
    *   }
    * */
    };

    this._users = {
        /*
        * userId ; {
        *   name: String,
        *   iconColor: Number
        * }
        * */
    };

    this.user = function(){};
}

CACHE.prototype.setDilog = function(id, dialog, messages, draft){
    // CHECK, do we have this method in our cache module.
    if(!this._dialogs[id]){
        this._dialogs[id] = {
            count: null,
            messages: [],
            draft: draft || null,
            users: dialog.users || [],
            name: dialog.name || ''
        };
    }

    if(messages && Array.isArray(messages)){
        this._dialogs[id].messages = this._dialogs[id].messages.concat(messages);
    } else if (messages){
        this._dialogs[id].messages.push(messages);
    }

    this._dialogs[id].draft = draft || null;
};

CACHE.prototype.getDialog = function(id){
    return this._dialogs[id] || null;
};

CACHE.prototype.setUser = function(user){
    var self = this,
        usersArray = [].concat(user);

    _.each(usersArray, function(user){
        self._users[user.id] = {
            name: user.name,
            color: user.color
        }
    })
};

CACHE.prototype.getUser = function(id){
    if (this._users[id]) return this._users[id];
};

CACHE.prototype.checkCachedUsersInDialog = function(id){
    var self = this,
        userList = this._dialogs[id].users,
        unsetUsers = [],
        result;

    for(var i = 0; i < userList.length; i++){
        if(!self._users[userList[i]]){
            unsetUsers.push(userList[i]);
        }
    }

    result = !unsetUsers.length;

    if(!result) {
        var params = {
            filter: {
                field: 'id',
                param: 'in',
                value: unsetUsers
            },
            per_page: 100
        };

        QB.users.listUsers(params, function(err, responce){
            var users = responce.items;
            _.each(users, function(data){
                var user = data.user;
                if(!self._users[user.id]){
                    self._users[user.id] = {
                        name: user.login,
                        color: _.random(1, 10)
                    }
                }
            });

            app.renderDialog(id);
        });
    }

    return result;
};

var cache = new CACHE();