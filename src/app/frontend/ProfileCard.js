import React from 'react';
import PropTypes from 'prop-types';
import {
  usePersoniumAuthentication,
  usePersoniumProfile,
  usePersoniumConfig,
} from './lib/Personium';

function ProfileImg({ src }) {
  return <img src={src} />;
}

ProfileImg.propTypes = {
  src: PropTypes.string.isRequired,
};

export function ProfileCard() {
  const { config } = usePersoniumConfig();
  const { auth } = usePersoniumAuthentication(config.appCellUrl);
  const { profile, loading, error } = usePersoniumProfile(auth.p_target);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error !== null) {
    return (
      <div>
        <h3>Error happenned</h3>
        <div>{JSON.stringify(error)}</div>
      </div>
    );
  }

  console.log(profile);

  return (
    <div className="card" style={{ padding: 8 }}>
      <h3>{profile.DisplayName}</h3>
      <blockquote>{profile.Description}</blockquote>
      <ProfileImg src={profile.Image} />
    </div>
  );
}
