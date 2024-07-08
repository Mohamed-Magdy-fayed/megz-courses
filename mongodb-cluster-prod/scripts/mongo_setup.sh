#!/bin/bash
sleep 20

mongosh --host mongo1prod:27017 <<EOF
  var cfg = {
    "_id": "myProdReplicaSet",
    "version": 1,
    "members": [
      {
        "_id": 0,
        "host": "mongo1prod:27017",
        "priority": 2
      },
      {
        "_id": 1,
        "host": "mongo2prod:27017",
        "priority": 0
      },
      {
        "_id": 2,
        "host": "mongo3prod:27017",
        "priority": 0
      }
    ]
  };
  rs.initiate(cfg);
EOF

# mongorestore /mongo_backup_data --host mongo1:27017
