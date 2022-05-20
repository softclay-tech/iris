import { define } from 'src/containerHelper';
module.exports = define('userService', ({ userRepository }) => {

  const getUserById = async userId => {
    return userRepository.getUserById(userId);
  };

  return {
    getUserById,
  };
});
