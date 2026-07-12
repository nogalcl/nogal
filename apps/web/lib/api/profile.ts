import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { PublicProfile } from "./types";

const PUBLIC_PROFILE_QUERY = gql`
  query PublicProfile($username: String!) {
    publicProfile(username: $username) {
      userId
      username
      firstName
      lastName
      avatarUrl
      bio
      city
      country {
        id
        name
        isoCode
      }
      memberSince
      reputation
      followersCount
      followingCount
      listingsCount
      salesCount
      isFollowedByViewer
      isOwnProfile
      store {
        id
        name
        slug
        isVerified
      }
      pieces {
        id
        title
        slug
        price
        currency
        decade
        condition
        locationCity
        categoryName
        categorySlug
        primaryMaterial
        primaryImage {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

export async function fetchPublicProfile(
  username: string,
  accessToken?: string,
): Promise<PublicProfile | null> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ publicProfile: PublicProfile | null }>(
    PUBLIC_PROFILE_QUERY,
    { username },
  );
  return data.publicProfile;
}
