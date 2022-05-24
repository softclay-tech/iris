import { define } from 'src/containerHelper'

module.exports = define('registrationDataEnrichmentService', ({ userRepository }) => {

  const getUser = async data => {
    console.log('getUser called', data)
    return {
      name: 'kamlesh',
      lastName: 'paliwal'
    }
  }

  return {
    getUser,
  }
})
