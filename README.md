# MarketMate

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs the necessary dependencies.

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Project Structure


```
MarketMate
├── LogicMarketMate.md
├── README.md
├── directory&Rules.md
├── package-lock.json
├── package.json
├── public
│   ├── android-chrome-192x192.png
│   ├── android-chrome-256x256.png
│   ├── apple-touch-icon.png
│   ├── browserconfig.xml
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   ├── index.html
│   ├── mstile-150x150.png
│   ├── safari-pinned-tab.svg
│   └── site.webmanifest
├── src
│   ├── App.css
│   ├── App.test.ts
│   ├── App.tsx
│   ├── assets
│   │   └── logo.png
│   ├── components
│   │   ├── Blog.tsx
│   │   ├── BusinessOwnerDetails.tsx
│   │   ├── BusinessOwnersDirectory.tsx
│   │   ├── ClaimsList.tsx
│   │   ├── CreateTokenClient.tsx
│   │   ├── Footer.tsx
│   │   ├── NavBar.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── Rewards
│   │   │   ├── ClaimReward.tsx
│   │   │   ├── CreateReward.tsx
│   │   │   └── ManageClaims.tsx
│   │   ├── Rewards.tsx
│   │   ├── SolanaWallet.tsx
│   │   ├── TransferToken.tsx
│   │   ├── UserSearch.tsx
│   │   ├── points
│   │   │   ├── AssignPoints.tsx
│   │   │   ├── ConfigurePoints.tsx
│   │   │   └── PointsHistory.tsx
│   │   └── tokenCreation
│   │       ├── BurnToken.tsx
│   │       ├── CreateMetadataForm.tsx
│   │       ├── CreateToken.tsx
│   │       ├── MintToken.tsx
│   │       ├── SolanaTokenTransfer.tsx
│   │       ├── TokenList.tsx
│   │       ├── TransferToken.tsx
│   │       ├── UploadImage.tsx
│   │       ├── splBurn.ts
│   │       ├── splMetadata.ts
│   │       ├── splMint.ts
│   │       └── splTransfer.ts
│   ├── controllers
│   │   └── AuthController.ts
│   ├── declarations.d.ts
│   ├── firebase.ts
│   ├── hooks
│   ├── index.css
│   ├── index.tsx
│   ├── logo.svg
│   ├── pages
│   │   ├── Admin.tsx
│   │   ├── BlogPostPage.tsx
│   │   ├── BusinessOwner.tsx
│   │   ├── BusinessOwnerDashboard.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DetailsPage.tsx
│   │   ├── DirectoryPage.tsx
│   │   ├── Email.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Registration.tsx
│   │   ├── RewardDetailPage.tsx
│   │   ├── UpdateBlogPost.tsx
│   │   ├── UpdateReward.tsx
│   │   ├── User.tsx
│   │   └── UserDashboard.tsx
│   ├── react-quill.d.ts
│   ├── reportWebVitals.ts
│   ├── services
│   │   ├── rewardService.ts
│   │   └── userService.ts
│   ├── setupTests.ts
│   ├── solanaContext.tsx
│   ├── types.ts
│   └── utils
│       ├── pinata.ts
│       ├── saveMetadataToFirebase.ts
│       ├── tokenBurn.ts
│       ├── uploadImage.ts
│       ├── uploadMetadataToPinata.ts
│       └── wallet.ts
├── tsconfig.json
└── webpack.config.js
```

### Firebase rulues


```
service cloud.firestore {
  match /databases/{database}/documents {

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /wallets/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /business_owners/{ownerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == ownerId;
    }

    match /followers/{ownerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == ownerId;
    }

    match /tokens/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }

    match /tokenMetadata/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }

    match /pointsConfiguration/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /points/{documentId} {
      allow read, write: if request.auth != null;
    }

    match /pendingRequests/{documentId} {
      allow read, write: if request.auth != null;
    }

    match /rewards/{rewardId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid != null; // Permetti a qualsiasi utente autenticato di scrivere
      allow delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }

    match /claims/{claimId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.uid == request.resource.data.userId ||
        request.auth.uid == request.resource.data.businessOwnerId
      );
      allow delete: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.auth.uid == resource.data.businessOwnerId
      );
    }
  }

    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /wallets/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /business_owners/{ownerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == ownerId;
    }

    match /followers/{ownerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == ownerId;
    }

    match /tokens/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }

    match /tokenMetadata/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }

    match /pointsConfiguration/{documentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    match /points/{documentId} {
      allow read, write: if request.auth != null;
    }

    match /pendingRequests/{documentId} {
      allow read, write: if request.auth != null;
    }

    match /rewards/{rewardId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid != null; // Permetti a qualsiasi utente autenticato di scrivere
      allow delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }

    match /claims/{claimId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        request.auth.uid == request.resource.data.userId ||
        request.auth.uid == request.resource.data.businessOwnerId
      );
      allow delete: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        request.auth.uid == resource.data.businessOwnerId
      );
    }
  }
}
```
