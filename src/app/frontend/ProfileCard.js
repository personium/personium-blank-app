import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  usePersoniumAuthentication,
  usePersoniumProfile,
} from './lib/Personium';

function ProfileImg({ src }) {
  return <img src={src} />;
}

ProfileImg.propTypes = {
  src: PropTypes.string.isRequired,
};

export function ProfileCard() {
  const { auth } = usePersoniumAuthentication();
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

  return (
    <div className="card">
      <ProfileImg src={profile.Image} />
    </div>
  );
}
