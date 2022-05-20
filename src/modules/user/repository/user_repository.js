import {
  define
} from 'src/containerHelper'

module.exports = define('userRepository', ({
  database
}) => {
  const UserModel = database['user']

  const getConfig = async whereClause => UserModel.findOne({
    where: {
      recordStatus: 1,
      ...whereClause
    }
  })


  return {
    getConfig
  }
})
